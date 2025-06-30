// Placeholder for a custom form hook
import { useState } from 'react';

// This is a very basic example. React Hook Form + Zod will be more complex.
const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    // Basic handling for checkbox, extend as needed
    // @ts-ignore
    const isCheckbox = type === 'checkbox';
 // @ts-ignore
    setValues({
      ...values,
      [name]: isCheckbox ? event.target.checked : value,
    });
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  return {
    values,
    handleChange,
    resetForm,
    setValues, // Allow direct setting of values if needed
  };
};

export default useForm;
