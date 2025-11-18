import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company_name: string;
    company_phone: string;
    company_email: string;
    captcha: string;
};

export default function Register() {
    const [captchaUrl, setCaptchaUrl] = useState<string>(() => `/captcha/default?ts=${Date.now()}`);
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        company_phone: '',
        company_email: '',
        captcha: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onError: () => {
                setCaptchaUrl(`/captcha/default?ts=${Date.now()}`);
                reset('captcha');
            },
        });
    };

    return (
        <AuthSimpleLayout>
            <Head title="Register" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create an account</h1>
                    <p className="text-sm text-gray-600">Enter your details below to create your account</p>
                </div>

                <form className="space-y-4" onSubmit={submit}>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.name} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.email} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                            Company Name
                        </Label>
                        <Input
                            id="company_name"
                            type="text"
                            required
                            tabIndex={3}
                            autoComplete="organization"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            disabled={processing}
                            placeholder="Company name"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.company_name} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="company_phone" className="text-sm font-medium text-gray-700">
                            Company Phone
                        </Label>
                        <Input
                            id="company_phone"
                            type="tel"
                            required
                            tabIndex={4}
                            autoComplete="tel"
                            value={data.company_phone}
                            onChange={(e) => setData('company_phone', e.target.value)}
                            disabled={processing}
                            placeholder="Company phone number"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.company_phone} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="company_email" className="text-sm font-medium text-gray-700">
                            Company Email
                        </Label>
                        <Input
                            id="company_email"
                            type="email"
                            required
                            tabIndex={5}
                            autoComplete="email"
                            value={data.company_email}
                            onChange={(e) => setData('company_email', e.target.value)}
                            disabled={processing}
                            placeholder="company@example.com"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.company_email} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={6}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.password} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.password_confirmation} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="captcha" className="text-sm font-medium text-gray-700">
                            Captcha
                        </Label>
                        <div className="flex items-center gap-3">
                            <img
                                src={captchaUrl}
                                alt="captcha"
                                className="h-10 rounded border"
                                onClick={() => setCaptchaUrl(`/captcha/default?ts=${Date.now()}`)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                                onClick={() => setCaptchaUrl(`/captcha/default?ts=${Date.now()}`)}
                            >
                                Refresh
                            </Button>
                        </div>
                        <Input
                            id="captcha"
                            type="text"
                            required
                            tabIndex={8}
                            value={data.captcha}
                            onChange={(e) => setData('captcha', e.target.value)}
                            disabled={processing}
                            placeholder="Enter captcha"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors.captcha} className="text-xs" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="pt-2"
                    >
                        <Button
                            type="submit"
                            className="h-11 w-full bg-gradient-to-r from-blue-700 to-blue-900 font-medium text-white transition-all duration-200 hover:from-blue-800 hover:to-blue-950 hover:shadow-lg hover:shadow-blue-500/25"
                            tabIndex={9}
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create account
                        </Button>
                    </motion.div>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="text-center text-sm text-gray-600"
                >
                    Already have an account?{' '}
                    <TextLink
                        href={route('login')}
                        tabIndex={10}
                        className="font-medium text-blue-700 transition-colors duration-200 hover:text-blue-900"
                    >
                        Log in
                    </TextLink>
                </motion.div>
            </motion.div>
        </AuthSimpleLayout>
    );
}
