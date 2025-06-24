import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom colors for Sweeply - changed from orange to blue
				pulse: {
					"50": "#eff6ff",
					"100": "#dbeafe",
					"200": "#bfdbfe",
					"300": "#93c5fd",
					"400": "#60a5fa",
					"500": "#3b82f6", // Primary blue
					"600": "#2563eb",
					"700": "#1d4ed8",
					"800": "#1e40af",
					"900": "#1e3a8a",
					"950": "#172554",
				},
				dark: {
					"900": "#121212", // Almost black
					"800": "#1e1e1e",
					"700": "#2d2d2d",
					"600": "#3d3d3d",
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'pure-fade': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-slide-up': {
					'0%': { opacity: '0', transform: 'translateY(15px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-slide-down': {
					'0%': { opacity: '0', transform: 'translateY(-15px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'exit-slide-down': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(20px)', opacity: '0' }
				},
				'exit-slide-up': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(-20px)', opacity: '0' }
				},
				'fade-in-right': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'fade-in-left': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'exit-slide-down-fast': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(10px)', opacity: '0.5' }
				},
				'exit-slide-up-fast': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(-10px)', opacity: '0.5' }
				},
				'fade-slide-down-fast': {
					'0%': { transform: 'translateY(-10px)', opacity: '0.5' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'fade-slide-up-fast': {
					'0%': { transform: 'translateY(10px)', opacity: '0.5' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-exit-left': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-20px)', opacity: '0' }
				},
				'slide-exit-right': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(20px)', opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.7s ease-out forwards',
				'pure-fade': 'pure-fade 0.3s ease-out forwards',
				'fade-slide-up': 'fade-slide-up 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'fade-slide-down': 'fade-slide-down 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'exit-slide-down': 'exit-slide-down 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'exit-slide-up': 'exit-slide-up 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'fade-in-right': 'fade-in-right 0.7s ease-out forwards',
				'fade-in-left': 'fade-in-left 0.7s ease-out forwards',
				'pulse-slow': 'pulse-slow 3s infinite',
				'float': 'float 6s ease-in-out infinite',
				'slide-left': 'slide-left 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'slide-right': 'slide-right 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'slide-exit-left': 'slide-exit-left 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'slide-exit-right': 'slide-exit-right 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'exit-slide-down-fast': 'exit-slide-down-fast 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'exit-slide-up-fast': 'exit-slide-up-fast 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'fade-slide-down-fast': 'fade-slide-down-fast 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'fade-slide-up-fast': 'fade-slide-up-fast 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
				'slide-up': 'slide-up 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
			},
			backgroundImage: {
				'hero-gradient': 'linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)',
				'hero-gradient-2': 'linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)',
				'pulse-gradient': 'linear-gradient(180deg, rgba(249,115,22,0.8) 0%, rgba(249,115,22,0) 100%)',
			},
			fontFamily: {
				'sans': ['Inter', 'sans-serif'],
				'display': ['Brockmann', 'SF Pro Display', 'Inter', 'sans-serif'],
				'brockmann': ['Brockmann', 'serif'],
				'playfair': ['"Playfair Display"', 'serif'],
			},
			boxShadow: {
				'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
				'elegant-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
