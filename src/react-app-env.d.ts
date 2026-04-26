/// <reference types="react-scripts" />
/// <reference types="node" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
        readonly REACT_APP_FIREBASE_API_KEY: string;
        readonly REACT_APP_FIREBASE_AUTH_DOMAIN: string;
        readonly REACT_APP_FIREBASE_PROJECT_ID: string;
        readonly REACT_APP_FIREBASE_STORAGE_BUCKET: string;
        readonly REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
        readonly REACT_APP_FIREBASE_APP_ID: string;
    }
}

declare module '*.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.sass' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.svg' {
    import * as React from 'react';
    export const ReactComponent: React.FunctionComponent<React.SVGProps<
        SVGSVGElement
    > & { title?: string }>;
    const src: string;
    export default src;
}
