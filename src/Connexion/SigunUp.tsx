import { useState } from "react";
import { Link } from "react-router-dom";
import { User, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo-serg.png";

function SignUp() {
  const [nom, setNom] = useState("");
  const [address, setAdress] = useState("");
  const [numeroTel, setNumeroTel] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (nom && address && numeroTel) {
      setError("");
      setSuccess("Inscription réussie 🎉");
    } else {
      setSuccess("");
      setError("Veuillez remplir tous les champs");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  from-blue-50 via-blue-100 to-indigo-100 p-4">
      <div className="w-full max-w-md">

        {/* Carte */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3 mb-4 shadow-lg">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Inscription
            </h1>
            <p className="text-gray-500 mt-2">Créez votre compte</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSignIn} className="space-y-5">

            {/* Nom */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Adresse */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Adresse"
                value={address}
                onChange={(e) => setAdress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Téléphone */}
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="034 ** *** **"
                value={numeroTel}
                onChange={(e) => setNumeroTel(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              S'inscrire
            </button>
          </form>

          {/* Lien login */}
          <div className="mt-6 text-center text-gray-600">
            Déjà un compte ?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:underline font-semibold"
            >
              Se connecter
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignUp;