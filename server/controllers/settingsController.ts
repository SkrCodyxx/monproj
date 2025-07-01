import { Request, Response, NextFunction } from 'express';
import db from '../db'; // Knex instance
import { AppSettings, CompanyInformation, TaxSettings, OpeningHours, SocialMediaLinks, LegalPages } from '../../src/types'; // Shared types
import * as z from 'zod';

const SETTINGS_TABLE = `${process.env.DB_SCHEMA || 'main'}.settings`;

// Define Zod schemas for each settings group for validation during update
const companyInfoSchema = z.object({
  name: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressCountry: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
  logoUrl: z.string().url("URL du logo invalide").optional().nullable(),
}).partial(); // All fields optional for update

const taxInfoSchema = z.object({
  defaultTaxRate: z.number().min(0).max(1).optional(), // e.g., 0.15
  currencySymbol: z.string().optional(),
}).partial();

const openingHoursSchema = z.object({
  monday: z.string().optional(),
  tuesday: z.string().optional(),
  wednesday: z.string().optional(),
  thursday: z.string().optional(),
  friday: z.string().optional(),
  saturday: z.string().optional(),
  sunday: z.string().optional(),
}).partial();

const socialMediaSchema = z.object({
  facebook: z.string().url("URL Facebook invalide").optional().nullable(),
  instagram: z.string().url("URL Instagram invalide").optional().nullable(),
  twitter: z.string().url("URL Twitter invalide").optional().nullable(),
  linkedin: z.string().url("URL LinkedIn invalide").optional().nullable(),
}).partial();

const legalPagesSchema = z.object({
  privacyPolicyUrl: z.string().url("URL Politique de confidentialité invalide").optional().nullable(),
  termsOfServiceUrl: z.string().url("URL Termes et Conditions invalide").optional().nullable(),
}).partial();

const appSettingsUpdateSchema = z.object({
  companyInfo: companyInfoSchema.optional(),
  taxInfo: taxInfoSchema.optional(),
  openingHours: openingHoursSchema.optional(),
  socialMedia: socialMediaSchema.optional(),
  legalPages: legalPagesSchema.optional(),
}).partial(); // Allow updating only some groups of settings


// Helper to transform DB rows (key-value) to AppSettings object
const rowsToAppSettings = (rows: Array<{setting_key: string, setting_value: string | null}>): AppSettings => {
    const settings: AppSettings = {
        companyInfo: {},
        taxInfo: {},
        openingHours: {},
        socialMedia: {},
        legalPages: {},
    };
    rows.forEach(row => {
        const keys = row.setting_key.split('.'); // e.g., "companyInfo.name"
        let currentLevel: any = settings;
        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                try {
                    // Attempt to parse if it's JSON (for complex objects like openingHours)
                    // Simple values will fail JSON.parse and be used directly
                    currentLevel[key] = JSON.parse(row.setting_value || 'null');
                } catch (e) {
                    currentLevel[key] = row.setting_value;
                }
            } else {
                if (!currentLevel[key]) currentLevel[key] = {};
                currentLevel = currentLevel[key];
            }
        });
    });
    return settings;
};


export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settingRows = await db(SETTINGS_TABLE).select('setting_key', 'setting_value');
    const appSettings = rowsToAppSettings(settingRows);

    // Provide default empty structures if some groups are entirely missing
    // This ensures the frontend always receives a consistent AppSettings shape.
    const defaults: AppSettings = {
        companyInfo: {}, taxInfo: {}, openingHours: {}, socialMedia: {}, legalPages: {}
    };

    res.status(200).json({
        companyInfo: appSettings.companyInfo || defaults.companyInfo,
        taxInfo: appSettings.taxInfo || defaults.taxInfo,
        openingHours: appSettings.openingHours || defaults.openingHours,
        socialMedia: appSettings.socialMedia || defaults.socialMedia,
        legalPages: appSettings.legalPages || defaults.legalPages,
    });

  } catch (error) {
    console.error("Get settings error:", error);
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = appSettingsUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Validation errors", errors: validationResult.error.flatten().fieldErrors });
    }

    const settingsToUpdate = validationResult.data;
    const operations: Promise<any>[] = [];

    await db.transaction(async trx => {
      for (const groupKey in settingsToUpdate) { // e.g., groupKey = "companyInfo"
        // @ts-ignore
        const groupData = settingsToUpdate[groupKey]; // e.g., { name: "New Name", phone: "123" }
        if (groupData && typeof groupData === 'object') {
          for (const specificKey in groupData) { // e.g., specificKey = "name"
            const dbKey = `${groupKey}.${specificKey}`; // e.g., "companyInfo.name"
            // @ts-ignore
            let dbValue = groupData[specificKey];

            // For structured objects like openingHours, socialMedia, legalPages, they are stored as single JSON string
            // The current AppSettings structure has them as nested objects directly.
            // We need to decide if each sub-property of openingHours (e.g. monday, tuesday) is a separate DB row
            // OR if openingHours itself is a single DB row with a JSON string value.
            // The current rowsToAppSettings helper assumes the latter for complex types if they fail simple JSON.parse.
            // Let's assume for simplicity that complex groups like openingHours, socialMedia, legalPages are stored as one JSON string per group.
            // Other simple key.value like companyInfo.name are stored as direct values.

            if (['openingHours', 'socialMedia', 'legalPages'].includes(groupKey) && typeof groupData === 'object') {
                 // This case means we are processing the whole group object.
                 // The loop for specificKey is not needed here; we process groupData directly.
                 // This part of the logic needs refinement if we want to store each sub-property.
                 // For now, let's assume the input `settingsToUpdate` is already structured like `AppSettings`
                 // and we'll flatten it for DB storage for specific keys, or stringify for group keys.

                 // Simplified: Store each individual field as its own key.
                 // "openingHours.monday", "openingHours.tuesday", etc.
                operations.push(
                    db(SETTINGS_TABLE)
                    .transacting(trx)
                    .where({ setting_key: dbKey })
                    .first()
                    .then(row => {
                        if (row) {
                        return db(SETTINGS_TABLE).transacting(trx).where({ setting_key: dbKey }).update({ setting_value: String(dbValue), updated_at: new Date() });
                        } else {
                        return db(SETTINGS_TABLE).transacting(trx).insert({ setting_key: dbKey, setting_value: String(dbValue), group_name: groupKey });
                        }
                    })
                );

            } else if (typeof groupData === 'object' && groupData !== null) { // For companyInfo, taxInfo
                 for (const specificKeyInGroup in groupData) {
                    const fullDbKey = `${groupKey}.${specificKeyInGroup}`;
                    // @ts-ignore
                    const value = groupData[specificKeyInGroup];
                    const valueToStore = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : (value === undefined || value === null ? null : String(value));

                    operations.push(
                        db(SETTINGS_TABLE)
                        .transacting(trx)
                        .where({ setting_key: fullDbKey })
                        .first()
                        .then(row => {
                            if (row) {
                            return db(SETTINGS_TABLE).transacting(trx).where({ setting_key: fullDbKey }).update({ setting_value: valueToStore, updated_at: new Date() });
                            } else {
                            return db(SETTINGS_TABLE).transacting(trx).insert({ setting_key: fullDbKey, setting_value: valueToStore, group_name: groupKey });
                            }
                        })
                    );
                 }
            }
          }
        }
      }
      await Promise.all(operations);
    });

    const updatedSettingRows = await db(SETTINGS_TABLE).select('setting_key', 'setting_value');
    const updatedAppSettings = rowsToAppSettings(updatedSettingRows);

    res.status(200).json({ message: 'Paramètres mis à jour avec succès!', settings: updatedAppSettings });

  } catch (error) {
    console.error("Update settings error:", error);
    next(error);
  }
};
