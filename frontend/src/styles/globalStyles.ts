import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    html, body, #root {
        height: 100%;
    }

    body {
        font-family: 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    /* Responsive text scaling */
    h1, h2, h3, h4, h5, h6 {
        line-height: 1.2;
    }

    @media (max-width: 768px) {
        body {
            font-size: 15px;
        }
    }

    @media (max-width: 480px) {
        body {
            font-size: 14px;
        }
    }
`;
