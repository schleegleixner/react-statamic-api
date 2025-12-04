'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
export default function PasswordForm({ className = '', lang = 'default', }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const res = yield fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        if (res.ok) {
            window.location.reload();
        }
        else {
            setError("Falsches Passwort. Versuch's nochmal.");
        }
    });
    return (React.createElement("html", { className: className, lang: lang },
        React.createElement("head", null,
            React.createElement("title", null, "Passwortschutz")),
        React.createElement("body", null,
            React.createElement("form", { className: "flex min-h-screen items-center justify-center bg-gray-900 font-sans text-white", onSubmit: handleSubmit },
                React.createElement("div", { className: "rounded bg-gray-800 p-6 shadow-md" },
                    React.createElement("h1", { className: "mb-4 text-lg font-bold" }, "Passwort erforderlich"),
                    React.createElement("input", { className: "mb-2 w-full rounded px-3 py-2 text-black", onChange: e => setPassword(e.target.value), placeholder: "Passwort", type: "password", value: password }),
                    error && React.createElement("p", { className: "mb-2 text-sm text-red-500" }, error),
                    React.createElement("button", { className: "w-full rounded bg-blue-600 px-4 py-2 font-bold hover:bg-blue-700", type: "submit" }, "Einloggen"))))));
}
