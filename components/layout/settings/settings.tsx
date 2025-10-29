"use client"

import clsx from 'clsx';
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function Settings() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (isAnimated) {
      setTimeout(() => {
        setIsAnimated(false);
      }, 1000);
    }
  }, [isAnimated]);

  const handleClick = () => {
    setIsAnimated(true);
    localStorage.clear()
  }

  return (
    <div className="relative">
      <Link href={'/'} className='mb-2.5 inline-block'>
        {'< '}Назад
      </Link>
      <section className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-indigo-200 pb-2 border-b border-gray-700">Настройки</h2>
        <div className="mt-5 flex items-center justify-between border-gray-700 border-b py-2.5">
          <p className="text-xl font-semibold text-indigo-100 mb-2">Почистить стор</p>
          <button
            className={clsx("flex items-center justify-center w-6 h-6 border border-gray-300 text-gray-300 rounded-full hover:bg-indigo-700 transition-colors duration-200 cursor-pointer",
              isAnimated && "animate-spin",
            )}
            onClick={handleClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M204-318q-22-38-33-78t-11-82q0-134 93-228t227-94h7l-64-64 56-56 160 160-160 160-56-56 64-64h-7q-100 0-170 70.5T240-478q0 26 6 51t18 49l-60 60ZM481-40 321-200l160-160 56 56-64 64h7q100 0 170-70.5T720-482q0-26-6-51t-18-49l60-60q22 38 33 78t11 82q0 134-93 228t-227 94h-7l64 64-56 56Z" /></svg>
          </button>
        </div>
      </section>
    </div>
  )
}
