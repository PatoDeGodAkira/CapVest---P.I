import React from 'react';


export default function Galeria({ titulo, descricao }) {
  return (
    <div className="card bg-base-100 shadow-xl p-6 m-4 text-center">
      <h2 className="card-title text-primary justify-center text-2xl">{titulo}</h2>
      <p className="text-gray-600 mt-2">{descricao}</p>
      <div className="card-actions justify-end mt-4">
        <button className="btn btn-sm btn-outline btn-primary">Ver mais</button>
      </div>
    </div>
  );
}

