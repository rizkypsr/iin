import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const layananFitur = [
    {
        title: 'IIN Nasional',
        description: 'Registrasi Identitas Investasi untuk WNI di seluruh Indonesia',
        icon: '🏛️',
        status: 'Tersedia',
    },
    {
        title: 'Single IIN',
        description: 'Identitas tunggal untuk semua aktivitas investasi Anda',
        icon: '🔗',
        status: 'Tersedia',
    },
    {
        title: 'Blockholder',
        description: 'Manajemen kepemilikan saham dan investasi institusi',
        icon: '📊',
        status: 'Tersedia',
    },
    {
        title: 'Pengawasan',
        description: 'Sistem monitoring dan pengawasan investasi real-time',
        icon: '🔍',
        status: 'Beta',
    },
];

const statistik = [
    { label: 'Total Pengguna Terdaftar', value: '145,892', change: '+12%' },
    { label: 'IIN Aktif', value: '98,342', change: '+8%' },
    { label: 'Transaksi Bulan Ini', value: '23,841', change: '+15%' },
    { label: 'Tingkat Kepuasan', value: '97.8%', change: '+2.3%' },
];

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Beranda - Portal Layanan Otoritas Sponsor">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            {/* Hero Section */}
            <section className="bg-gradient-primary relative flex min-h-[100vh] items-center overflow-hidden pt-20">
                {/* SVG Background - Full Width */}
                <motion.div
                    className="absolute inset-0 z-[1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                >
                    <div
                        className="absolute inset-0 h-full w-full opacity-10"
                        style={{
                            backgroundImage: 'url("/biner.svg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    ></div>
                </motion.div>

                {/* Technical Line Pattern Overlay */}
                <motion.div
                    className="absolute inset-0 z-[2]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                            linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(45deg, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(-45deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                        `,
                            backgroundSize: '80px 80px, 80px 80px, 40px 40px, 40px 40px',
                        }}
                    ></div>
                </motion.div>

                {/* Gradient Accent Lines */}
                <motion.div
                    className="absolute inset-0 z-[3]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
                >
                    {/* Diagonal accent lines */}
                    <div className="absolute top-0 right-0 h-full w-full overflow-hidden">
                        <div className="absolute top-1/4 right-0 h-[2px] w-[800px] origin-right rotate-12 transform bg-gradient-to-l from-white/20 to-transparent"></div>
                        <div className="absolute top-1/3 right-0 h-[1px] w-[600px] origin-right rotate-6 transform bg-gradient-to-l from-white/15 to-transparent"></div>
                        <div className="absolute right-0 bottom-1/4 h-[2px] w-[700px] origin-right -rotate-8 transform bg-gradient-to-l from-white/18 to-transparent"></div>
                    </div>
                </motion.div>

                <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    {/* Centered Content Area */}
                    <motion.div
                        className="max-w-5xl space-y-8 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        >
                            <motion.h1
                                className="text-5xl leading-tight font-bold tracking-tight text-white lg:text-7xl"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            >
                                Selamat Datang di
                                <motion.span
                                    className="mt-2 block text-white"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                                >
                                    Portal Layanan Otoritas Sponsor
                                </motion.span>
                            </motion.h1>
                            <motion.p
                                className="mx-auto text-xl leading-relaxed font-medium text-white/90 lg:text-2xl"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                            >
                                Layanan Otoritas Sponsor adalah Layanan yang diberikan BSN untuk  menerima, memproses dan meninjau / menyetujui
                                permohonan untuk IIN (Issuer Identification Number)
                            </motion.p>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1, ease: 'easeOut' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href={route('register')}>
                                    <Button className="bg-gradient-accent hover:bg-gradient-secondary min-w-[200px] transform rounded-lg border-0 px-8 py-6 text-sm text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                        Mulai Pendaftaran
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link href={route('jenis-layanan')}>
                                    <Button
                                        variant="outline"
                                        className="min-w-[200px] rounded-lg border border-white/30 bg-transparent px-8 py-6 text-sm text-white shadow-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white hover:shadow-md"
                                    >
                                        Pelajari Layanan
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Statistics Section */}
            <motion.section
                className="bg-white py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mb-16 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    >
                        <motion.h2
                            className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        >
                            Portal Layanan Otoritas Sponsor dalam Angka
                        </motion.h2>
                        <motion.p
                            className="mx-auto max-w-2xl text-lg text-gray-700"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                        >
                            Dipercaya oleh ribuan investor dan institusi di seluruh Indonesia
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        {statistik.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.6 + index * 0.1,
                                    ease: 'easeOut',
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <Card className="rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 text-center transition-shadow duration-300 hover:shadow-lg">
                                    <CardContent className="p-8">
                                        <motion.div
                                            className="mb-2 text-4xl font-bold text-gray-900"
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.8 + index * 0.1,
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                        >
                                            {stat.value}
                                        </motion.div>
                                        <p className="mb-2 text-sm font-medium text-gray-700">{stat.label}</p>
                                        <p className="text-xs font-semibold text-green-700">{stat.change} dari bulan lalu</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* Services Section */}
            <motion.section
                className="bg-gray-50 py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mb-16 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    >
                        <motion.h2
                            className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        >
                            Layanan Unggulan
                        </motion.h2>
                        <motion.p
                            className="mx-auto max-w-3xl text-lg text-gray-700"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                        >
                            Berbagai layanan komprehensif untuk mendukung aktivitas investasi Anda di Indonesia
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        {layananFitur.map((layanan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.6 + index * 0.15,
                                    ease: 'easeOut',
                                }}
                                whileHover={{
                                    scale: 1.03,
                                    y: -5,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <Card className="transform rounded-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <CardHeader className="pb-4">
                                        <motion.div
                                            className="mb-4 text-4xl"
                                            initial={{ scale: 0, rotate: -180 }}
                                            whileInView={{ scale: 1, rotate: 0 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.8 + index * 0.15,
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                        >
                                            {layanan.icon}
                                        </motion.div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <CardTitle className="text-xl">{layanan.title}</CardTitle>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: 1 + index * 0.15,
                                                    type: 'spring',
                                                }}
                                            >
                                                <Badge
                                                    variant={layanan.status === 'Tersedia' ? 'default' : 'secondary'}
                                                    className={
                                                        layanan.status === 'Tersedia'
                                                            ? 'rounded-full bg-green-100 text-green-800'
                                                            : 'rounded-full bg-orange-100 text-orange-800'
                                                    }
                                                >
                                                    {layanan.status}
                                                </Badge>
                                            </motion.div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="leading-relaxed text-gray-700">{layanan.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        className="mt-12 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href={route('jenis-layanan')}>
                                <Button className="bg-gradient-accent hover:bg-gradient-secondary rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300">
                                    Lihat Semua Layanan
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                className="bg-gradient-secondary py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-3xl space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    >
                        <motion.h2
                            className="text-3xl font-bold text-white lg:text-4xl"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                        >
                            Siap Memulai Perjalanan Investasi Anda?
                        </motion.h2>
                        <motion.p
                            className="text-xl leading-relaxed text-white"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                        >
                            Bergabunglah dengan ribuan investor yang telah mempercayai Portal Layanan Otoritas Sponsor untuk mengelola investasi mereka
                        </motion.p>
                        <motion.div
                            className="flex flex-col justify-center gap-4 sm:flex-row"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href={route('register')}>
                                    <Button className="transform rounded-xl bg-white px-6 py-4 text-sm font-semibold text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
                                        Daftar Sekarang
                                    </Button>
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href={route('pengaduan')}>
                                    <Button className="transform rounded-xl bg-white px-6 py-4 text-sm font-semibold text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100">
                                        Hubungi Kami
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>
        </PublicLayout>
    );
}
