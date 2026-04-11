import React from "react";

export const AtmosphereCheck = () => {
  return (
    <div className="flex flex-col gap-8 p-12 bg-surface min-h-[300px]">
      <section className="flex flex-col gap-4">
        <h2 className="text-secondary font-sans font-semibold text-lg uppercase tracking-wider">
          Typography & Color Check
        </h2>
        <div className="bg-primary text-primary-foreground p-6 rounded-md shadow-ambient">
          <p className="font-sans font-bold text-2xl">
            This is Manrope Font (Emerald Action)
          </p>
          <p className="font-sans text-sm opacity-90 mt-2">
            Verifying bg-primary, text-primary-foreground, font-sans, and shadow-ambient.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-secondary font-sans font-semibold text-lg uppercase tracking-wider">
          Glass & Shadow Check
        </h2>
        <div className="glass-surface p-8 rounded-md border border-white/20 shadow-ambient">
          <p className="text-on-surface font-sans">
            Glass Surface Utility with Ambient Shadow.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-secondary font-sans font-semibold text-lg uppercase tracking-wider">
          Gradient Check
        </h2>
        <div className="bg-signature-gradient p-6 rounded-md text-white h-24 flex items-center justify-center">
          <span className="font-sans font-extrabold tracking-tight">
            SIGNATURE GRADIENT
          </span>
        </div>
      </section>
    </div>
  );
};
