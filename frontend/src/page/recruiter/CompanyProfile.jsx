import React from 'react';
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";

export default function CompanyProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Profil entreprise
          </h1>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600">Page en cours de construction</p>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}