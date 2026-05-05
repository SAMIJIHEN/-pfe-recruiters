import { SignUp } from "@clerk/clerk-react";

export default function CandidateSignUp() {
  return (
    <SignUp
      unsafeMetadata={{ userType: "candidate" }}
      fallbackRedirectUrl="/complete-profile"
      appearance={{
        elements: {
          rootBox: {
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          },
          card: {
            boxShadow: "none",
            padding: "30px",
            width: "100%",
            maxWidth: "700px",
          },
          headerTitle: { display: "none" },
          headerSubtitle: { display: "none" },
          formFieldLabel: {
            fontSize: "13px",
            fontWeight: "700",
            color: "#102A24",
            marginBottom: "4px",
          },
          formFieldInput: {
            borderRadius: "14px",
            border: "1px solid rgba(16,42,36,.10)",
            height: "48px",
            fontSize: "14px",
            padding: "0 14px",
            marginBottom: "14px",
            width: "100%",
            "&:focus": {
              boxShadow: "0 0 0 4px rgba(31,122,90,.12)",
              borderColor: "rgba(31,122,90,.55)",
            },
          },
          formButtonPrimary: {
            background: "#1F7A5A",
            borderRadius: "14px",
            height: "48px",
            fontSize: "16px",
            fontWeight: "900",
            marginTop: "10px",
            border: "none",
            boxShadow: "0 16px 40px rgba(31,122,90,.25)",
            width: "100%",
            "&:hover": { background: "#0EA371" },
          },
          footer: { display: "none" },
          identityPreview: { display: "none" },
          socialButtonsBlockButton: {
            borderRadius: "14px",
            height: "46px",
            border: "1px solid rgba(16,42,36,.10)",
            background: "#fff",
            fontWeight: "600",
            marginBottom: "8px",
            width: "100%",
          },
          dividerLine: { display: "none" },
          dividerText: { display: "none" },
          formField: {
            width: "100%",
          },
          form: {
            width: "100%",
          },
        },
      }}
    />
  );
}