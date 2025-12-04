import React from 'react';
export default function EyeAble({ src }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("script", { async: true, src: src }),
        React.createElement("script", { async: true, src: "https://cdn.eye-able.com/public/js/eyeAble.js" })));
}
