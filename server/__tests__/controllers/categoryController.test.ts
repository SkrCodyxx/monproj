import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createCategory } from '../../controllers/categoryController'; // Adjust path
import db from '../../db'; // Adjust path to your Knex instance

// Mock the db (Knex instance)
vi.mock('../../db', () => ({
  default: vi.fn().mockReturnThis(), // Mock Knex's chainable interface
  // Individual Knex methods that are used:
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  first: vi.fn(),
  returning: vi.fn(),
  // Add other methods if your controller uses them
}));

// Mock Request, Response, NextFunction
const mockRequest = (body?: any, params?: any, user?: any) => ({
  body: body || {},
  params: params || {},
  user: user || null, // For protected routes if user info is attached
}) as unknown as Request;

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res as Response);
  res.json = vi.fn().mockReturnValue(res as Response);
  return res as Response;
};

const mockNext = vi.fn() as NextFunction;


describe('Category Controller - createCategory', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
    // Reset mocks for db methods before each test
    // vi.mocked(db).mockClear(); // This clears the mock itself, not good for chainable
    // Instead, reset specific method mocks if they were set to resolve values:
    vi.mocked(db.first).mockReset();
    vi.mocked(db.insert).mockReset();
    vi.mocked(db.returning).mockReset();
    vi.mocked(db.where).mockClear(); // Clear call counts etc. for where
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a category successfully', async () => {
    req = mockRequest({ name: 'New Category', description: 'A cool new category' });

    // Mock DB responses
    vi.mocked(db.first)
      .mockResolvedValueOnce(undefined) // For checking if category name exists (it doesn't)
      .mockResolvedValueOnce({ id: 1, name: 'New Category', description: 'A cool new category' }); // For fetching the created category

    // For SQLite, insert().returning('id') might return just the ID or an array of IDs.
    // For PostgreSQL, it's typically an array of objects: [{ id: 1 }]
    // Let's assume it returns an object with id for consistency or an array with one object.
    // The controller handles both [id] and [{id:val}]
    vi.mocked(db.returning).mockResolvedValue([{ id: 1 }]);


    await createCategory(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Catégorie créée avec succès!',
        category: expect.objectContaining({ name: 'New Category', id: 1 }),
      })
    );
    expect(db.insert).toHaveBeenCalledWith({ name: 'New Category', description: 'A cool new category' });
  });

  it('should return 400 if name is missing', async () => {
    req = mockRequest({ description: 'Category without a name' });
    await createCategory(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation errors',
        errors: expect.objectContaining({ name: expect.any(Array) }),
      })
    );
  });

  it('should return 409 if category name already exists', async () => {
    req = mockRequest({ name: 'Existing Category' });
    vi.mocked(db.first).mockResolvedValueOnce({ id: 2, name: 'Existing Category' }); // Simulate category exists

    await createCategory(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Une catégorie nommée 'Existing Category' existe déjà." });
  });

  it('should return 409 on SQLite UNIQUE constraint error', async () => {
    req = mockRequest({ name: 'Unique Fail Category' });
    const sqliteError = new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed: categories.name") as any;
    sqliteError.code = 'SQLITE_CONSTRAINT';

    vi.mocked(db.first).mockResolvedValueOnce(undefined); // Does not exist initially
    vi.mocked(db.returning).mockRejectedValue(sqliteError); // Fails on insert

    await createCategory(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Une catégorie nommée 'Unique Fail Category' existe déjà." });
  });


  it('should call next with error if database insertion fails unexpectedly (after first check)', async () => {
    req = mockRequest({ name: 'DB Fail Category' });
    const dbError = new Error('Unexpected DB error');

    vi.mocked(db.first).mockResolvedValueOnce(undefined); // Initial check passes
    vi.mocked(db.returning).mockRejectedValue(dbError); // Fails on insert

    await createCategory(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });

  it('should call next with error if fetching created category fails', async () => {
    req = mockRequest({ name: 'Fetch Fail Category' });
    const dbError = new Error('DB error on fetch after insert');

    vi.mocked(db.first)
      .mockResolvedValueOnce(undefined) // Name check passes
      .mockRejectedValueOnce(dbError);   // Fails when trying to fetch the newly created category

    vi.mocked(db.returning).mockResolvedValue([{ id: 1 }]); // Insert itself succeeds

    await createCategory(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledWith(dbError);
  });

});
