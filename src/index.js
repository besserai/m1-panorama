import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';

function createMarginStyleOverrides() {
    return {
        styleOverrides: {
            root: {
                margin: '10px',
            },
        },
    };
}

// Create a theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976D2',
        },
        secondary: {
            main: '#FFFFFF',
        },
    },
    spacing: 10,
    components: {
        MuiButton: createMarginStyleOverrides(),
        MuiTextField: createMarginStyleOverrides(),
        MuiFormControl: createMarginStyleOverrides(),
        MuiFormLabel: createMarginStyleOverrides(),
        MuiInput: createMarginStyleOverrides(),
        MuiInputLabel: createMarginStyleOverrides(),
        MuiSlider: createMarginStyleOverrides(),
        MuiToggleButton: createMarginStyleOverrides(),
        MuiToggleButtonGroup: createMarginStyleOverrides(),
        MuiRadio: createMarginStyleOverrides(),
        MuiCheckbox: createMarginStyleOverrides(),
        MuiFormControlLabel: createMarginStyleOverrides(),
        MuiSelect: createMarginStyleOverrides(),

    },

}
)

createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={theme}>

        <App />
    </ThemeProvider>
)
