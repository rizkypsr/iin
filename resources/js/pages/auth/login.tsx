import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Sign in to Your Account" description="">
            <Head title="Sign in" />

            {status && (
                <motion.div
                    className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {status}
                </motion.div>
            )}

            <form className="space-y-6" onSubmit={submit}>
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                >
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email"
                            className="h-12 rounded-lg border-gray-200 px-4 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-500" tabIndex={5}>
                                    Forgotten password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                            className="h-12 rounded-lg border-gray-200 px-4 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="border-gray-300"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600">
                            Remember me
                        </Label>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                >
                    <Button
                        type="submit"
                        className="bg-gradient-accent hover:bg-gradient-secondary h-12 w-full rounded-lg font-medium text-white transition-all duration-300"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </motion.div>

                <motion.div
                    className="text-center text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                >
                    Need an Account?{' '}
                    <TextLink href={route('register')} tabIndex={5} className="font-medium text-blue-600 hover:text-blue-500">
                        Create Account
                    </TextLink>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
