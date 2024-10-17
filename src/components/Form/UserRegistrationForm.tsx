import { FC, memo, useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import { Button, Typography, Snackbar, IconButton, CircularProgress } from "@mui/material";
import { debounce } from "lodash";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CustomTextField from "../CustomTextField";
import CloseIcon from "@mui/icons-material/Close";
import { validationSchema } from "./validationSchema";

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const UserRegistrationForm: FC = memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [savedValues, setSavedValues] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedFormData = localStorage.getItem("userRegistrationDraft");
    if (savedFormData) {
      setSavedValues(JSON.parse(savedFormData));
    }
    setIsLoading(false); // Indicate that loading is complete

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setShowNotification(true);
        }
      });
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  const initialValues: FormValues = {
    fullName: savedValues?.fullName || "",
    email: savedValues?.email || "",
    password: savedValues?.password || "",
    confirmPassword: savedValues?.confirmPassword || "",
  };

  const debouncedSaveDraft = debounce((values: FormValues) => {
    localStorage.setItem("userRegistrationDraft", JSON.stringify(values));
  }, 500);

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "users"), {
        fullName: values.fullName,
        email: values.email,
        // Use proper hashing in real applications.
        password: values.password,
      });
      setShowSuccess(true);
      resetForm();
      localStorage.removeItem("userRegistrationDraft");
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while values are loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 h-full w-full justify-center">
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        User Registration
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={true}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <CustomTextField
              name="fullName"
              label="Full Name"
              value={values.fullName}
              onChange={(e) => {
                handleChange(e);
                debouncedSaveDraft(values);
              }}
              onBlur={handleBlur}
              error={touched.fullName && !!errors.fullName}
              helperText={touched.fullName ? errors.fullName : ""}
              disabled={isSubmitting}
            />
            <CustomTextField
              name="email"
              label="Email Address"
              value={values.email}
              onChange={(e) => {
                handleChange(e);
                debouncedSaveDraft(values);
              }}
              onBlur={handleBlur}
              error={touched.email && !!errors.email}
              helperText={touched.email ? errors.email : ""}
              disabled={isSubmitting}
            />
            <CustomTextField
              name="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={(e) => {
                handleChange(e);
                debouncedSaveDraft(values);
              }}
              onBlur={handleBlur}
              error={touched.password && !!errors.password}
              helperText={touched.password ? errors.password : ""}
              disabled={isSubmitting}
            />
            <CustomTextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => {
                handleChange(e);
                debouncedSaveDraft(values);
              }}
              onBlur={handleBlur}
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword ? errors.confirmPassword : ""}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Register"}
            </Button>
          </Form>
        )}
      </Formik>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        message="Registration successful!"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setShowSuccess(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={() => setShowNotification(false)}
        message="A new notification recieved!"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setShowNotification(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
});

export default UserRegistrationForm;
