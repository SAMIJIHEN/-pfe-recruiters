// src/pages/profile/ResumeUpload.jsx
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { FaFilePdf, FaTimes, FaCloudUploadAlt } from "react-icons/fa";

export default function ResumeUpload({
  uploadFile,
  uploadProgress = 0,
  initialFileName = "",
  onParsed,
  onFileSelected,
}) {
  const { user, isSignedIn } = useUser();

  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(initialFileName || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setFileName(initialFileName || "");
  }, [initialFileName]);

  const pickFile = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFileName("");
    setErr("");
    if (inputRef.current) inputRef.current.value = "";
    onFileSelected?.(null);
    onParsed?.(null);
  };

  const handleChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Vérifier que l'utilisateur est connecté avec Clerk
    if (!isSignedIn || !user) {
      setErr("Utilisateur non connecté.");
      return;
    }

    // Validation simple
    if (f.size > 5 * 1024 * 1024) {
      setErr("Le fichier ne doit pas dépasser 5 Mo.");
      return;
    }

    setFileName(f.name);
    setErr("");
    setLoading(true);

    onFileSelected?.(f);

    try {
      const res = await uploadFile(f, "cv", {
        returnFullResponse: true,
        headers: {
          "X-Clerk-User-Id": user.id,
          "X-User-Email": user.primaryEmailAddress?.emailAddress || "",
          "X-User-Firstname": user.firstName || "",
          "X-User-Lastname": user.lastName || "",
        },
      });

      // Supporte plusieurs formats backend
      const payload = res?.data || res;
      const structured =
        payload?.structured ||
        payload?.cv_parsed ||
        payload?.parsed ||
        null;

      if (structured && !structured.error) {
        onParsed?.(structured);
      } else if (structured?.error) {
        setErr(`CV importé, mais l’analyse IA a échoué : ${structured.error}`);
        onParsed?.(null);
      } else {
        setErr("CV importé, mais aucune donnée exploitable n’a été reçue.");
        onParsed?.(null);
      }
    } catch (error) {
      console.error("Erreur upload CV :", error);

      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Erreur lors de l’analyse du CV."
      );
      onParsed?.(null);
    } finally {
      setLoading(false);
    }
  };

  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">CV / Résumé</h3>
          <p className="text-sm text-gray-500 mt-1">
            Importez votre CV pour préremplir automatiquement certaines parties
            du formulaire.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Optionnel mais recommandé
        </span>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer
          ${
            loading
              ? "border-emerald-300 bg-emerald-50"
              : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/40"
          }`}
        onClick={pickFile}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pickFile();
          }
        }}
      >
        {!fileName ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
              <FaCloudUploadAlt className="text-2xl text-emerald-600" />
            </div>

            <p className="text-base font-semibold text-gray-800">
              {loading ? "Analyse du CV en cours..." : "Cliquez pour importer votre CV"}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Formats acceptés : PDF, DOC, DOCX, TXT, image
            </p>

            <p className="text-xs text-gray-400 mt-1">Taille maximale : 5 Mo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 max-w-full">
              {isPdf ? (
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                  <FaFilePdf className="text-red-600 text-lg" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">📄</span>
                </div>
              )}

              <div className="text-left min-w-0">
                <p
                  className="font-medium text-gray-800 truncate max-w-[220px] sm:max-w-[320px]"
                  title={fileName}
                >
                  {fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {loading ? "Analyse en cours..." : "Fichier prêt"}
                </p>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                aria-label="Supprimer le fichier"
              >
                <FaTimes />
              </button>
            </div>

            {!loading && (
              <p className="text-sm text-emerald-700 font-medium">
                CV importé avec succès
              </p>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Téléversement</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {!err && !loading && fileName && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Après analyse, une fenêtre de confirmation proposera de remplir
          automatiquement les champs vides du formulaire.
        </div>
      )}
    </div>
  );
}