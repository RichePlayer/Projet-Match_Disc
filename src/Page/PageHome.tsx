import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import img1 from "../assets/image-one.png";
import img2 from "../assets/image-two.png";
import img3 from "../assets/image-three.png";
import img4 from "../assets/image-four.png";



function PageHome() {
  const images = [img1, img2, img3, img4];
  const [index, setIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Changer d'image toutes les 3 secondes
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    //bg-gradient-to-br
    <div className="min-h-screen  from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center  py-8 px-4">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* 🟦 CONTENU À GAUCHE */}
          <div className="lg:w-1/2 space-y-6 animate-fadeInLeft">
            {/* Badge */}
           

            {/* Titre principal */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Bienvenue
              </span>
              <br />
              <span className="text-white">sur notre plateforme de</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                recherche optimale
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed">
              Découvrez notre solution de recherche optimale pour trouver les meilleurs résultats 
              en un seul clic. Grâce à l'algorithme de Dijkstra, optimisez vos trajets et 
              trouvez les chemins les plus efficaces.
            </p>

            {/* Statistiques */}
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-400">Précision</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">&lt; 1s</div>
                <div className="text-sm text-gray-400">Temps calcul</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400">Disponible</div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/min" 
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 overflow-hidden"
              >
                <TrendingDown className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Dijkstra Minimum</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
              
              <Link 
                to="/max" 
                className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 overflow-hidden"
              >
                <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Dijkstra Maximum</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 pt-6">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>Algorithmes optimisés</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span>Résultats en temps réel</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span>Interface intuitive</span>
              </div>
            </div>
          </div>

          {/* 🟥 IMAGE À DROITE AVEC CARROUSEL */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative group">
              {/* Image principale */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={images[index]}
                  alt={`Slide ${index + 1}`}
                  className="w-[500px] h-[350px] object-cover rounded-2xl transition-all duration-700 transform group-hover:scale-105"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>

              {/* Contrôles du carrousel */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={prevImage}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Indicateurs */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className={`transition-all duration-300 ${
                      i === index 
                        ? "w-8 h-2 bg-white rounded-full" 
                        : "w-2 h-2 bg-white/50 rounded-full hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>

              {/* Bouton pause/play */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Compteur */}
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                {index + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease-out;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PageHome;