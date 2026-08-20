import React from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Zap } from "lucide-react";

const WhileYouWait = ({ status }) => {
  const navigate = useNavigate();

  if (status !== "pending" && status !== "preparing") return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => navigate("/game")}
        className="fb-card fb-card--link group w-full p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-light flex items-center gap-1">
              Mientras esperas
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </p>
            <p className="text-xs text-gray">
              Diviértete con nuestros juegos interactivos
            </p>
          </div>
          <span className="text-xs text-violet-400 font-medium group-hover:text-violet-300 transition-colors">
            Jugar
          </span>
        </div>
      </button>
    </div>
  );
};

export default WhileYouWait;
