import { useField } from "formik";

export const useFormikInput = (name: string) => {
  const [field, meta] = useField(name);

  return {
    field, // { name, value, onChange, onBlur }
    error: meta.touched && meta.error ? meta.error : "",
    isError: meta.touched && !!meta.error,
  };
};
