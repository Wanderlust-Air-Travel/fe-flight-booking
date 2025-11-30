"use client";

/**
 * Toast Provider Component
 * Wraps the application with React-Toastify ToastContainer
 * Must be a client component to use react-toastify
 */

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
	return (
		<ToastContainer
			position="top-right"
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="light"
			style={{
				zIndex: 9999,
			}}
		/>
	);
}

