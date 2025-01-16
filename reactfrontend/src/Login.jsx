import React, { useState } from 'react';
import bgimage from './assets/2.jpg';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(null); // Initialize role as null
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        // Validate email and password
        if (!email || !password) {
            setErrorMessage('Please enter both email and password');
            setLoading(false);
            return;
        }

        // Validate role
        if (!role) {
            setErrorMessage('Please select a role');
            setLoading(false);
            return;
        }

        try {
            const result = await login(email, password, role, rememberMe);
            if (result.success) {
                navigate(result.redirectUrl || '/api/dashboard');
            } else {
                setErrorMessage(result.error || 'An unknown error occurred');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'admin-user', label: 'Admin' },
        { id: 'user', label: 'Regular Staff' },
    ];

    return (
        <div
            className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
            style={{
                backgroundImage: `url(${bgimage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black opacity-50"></div>

            {/* Login Form */}
            <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Human Resources Software</h2>
                    <p className="text-gray-600">Select your role and sign in</p>
                </div>

                {errorMessage && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4"
                        role="alert"
                    >
                        {errorMessage}
                    </div>
                )}

                {/* Role Selection */}
                <div className="flex justify-center space-x-2 mb-6">
                    {roles.map((roleOption) => (
                        <button
                            key={roleOption.id}
                            type="button" // Add type="button" to prevent form submission
                            className={`
                                px-4 py-2 rounded-lg transition duration-300
                                ${role === roleOption.id
                                    ? 'bg-blue-500 text-white scale-105 shadow-md'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                            `}
                            onClick={() => setRole(roleOption.id)}
                        >
                            {roleOption.label}
                        </button>
                    ))}
                </div>

                {/* Login Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                            required // Make email field required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your password"
                                required // Make password field required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <a
                            href="/forgot-password"
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
                            loading
                                ? 'bg-blue-400 cursor-wait'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;