import * as Yup from "yup";

export const validationSchema = Yup.object({
    fullName: Yup.string()
      .required("Full Name is required")
      .matches(
        /^[a-zA-Z\s]+$/,
        "Full Name should not contain numbers or special characters"
      ),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        "Password must include letters, numbers, and special characters"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm Password is required"),
  });