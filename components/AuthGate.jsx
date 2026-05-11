// app/AuthGate.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleAuth = async (type) => {
    try {
      if (type === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-4">
      <div className="bg-white border-[6px] border-black rounded-[50px] p-10 w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="font-['Londrina_Solid'] text-5xl uppercase mb-8 text-center leading-none">Authorization Required</h1>
        <input 
          className="w-full border-4 border-black p-4 rounded-[25px] mb-4 font-bold focus:outline-none"
          placeholder="RESEARCHER EMAIL" 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          className="w-full border-4 border-black p-4 rounded-[25px] mb-8 font-bold focus:outline-none"
          type="password" 
          placeholder="SECURITY KEY" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => handleAuth('login')}
            className="bg-black text-white py-4 rounded-[25px] font-['Londrina_Solid'] text-2xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >Sign In</button>
          <button 
            onClick={() => handleAuth('signup')}
            className="border-4 border-black py-4 rounded-[25px] font-['Londrina_Solid'] text-2xl uppercase"
          >Register New Researcher</button>
        </div>
      </div>
    </div>
  );
}