import React from 'react';
import { FileText, AlertCircle, CreditCard, MapPin, Award, Clock } from 'lucide-react';

export type ApplicationStatus =
    | 'pengajuan'
    | 'perbaikan'
    | 'pembayaran'
    | 'verifikasi-lapangan'
    | 'pembayaran-tahap-2'
    | 'terbit'
    | 'draft'
    | 'submitted'
    | 'payment_verified'
    | 'field_verification'
    | 'issued'
    | 'menunggu-terbit';

interface StatusConfig {
    badgeClass: string;
    label: string;
    detailedLabel?: string;
}

const STATUS_CONFIGS: Partial<Record<ApplicationStatus, StatusConfig>> = {
    'pengajuan': {
        badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        label: 'Pengajuan',
        detailedLabel: 'Sedang Diajukan'
    },
    'perbaikan': {
        badgeClass: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 border-amber-400 font-medium animate-pulse',
        label: 'Perbaikan',
        detailedLabel: 'Perlu Perbaikan'
    },
    'pembayaran': {
        badgeClass: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        label: 'Pembayaran',
        detailedLabel: 'Pembayaran Tahap 1'
    },
    'verifikasi-lapangan': {
        badgeClass: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
        label: 'Verifikasi Lapangan',
        detailedLabel: 'Verifikasi Lapangan'
    },
    'pembayaran-tahap-2': {
        badgeClass: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
        label: 'Pembayaran Tahap 2',
        detailedLabel: 'Pembayaran Tahap 2'
    },
    'terbit': {
        badgeClass: 'bg-green-100 text-green-800 hover:bg-green-200',
        label: 'Terbit',
        detailedLabel: 'Sudah Terbit'
    }
};

/**
 * Normalizes a status string by converting to lowercase and trimming whitespace
 * @param status - The status string to normalize
 * @returns Normalized status string
 */
function normalizeStatus(status: string): ApplicationStatus | null {
    const normalized = String(status).trim().toLowerCase() as ApplicationStatus;
    return STATUS_CONFIGS[normalized] ? normalized : null;
}

/**
 * Gets the CSS class names for status badge styling
 * @param status - The application status
 * @param options - Configuration options
 * @param options.detailed - Whether to use detailed styling (for SingleIin)
 * @returns CSS class string for badge styling
 */
export function getStatusBadgeClass(
    status: string,
    options: { detailed?: boolean } = {}
): string {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus) {
        const config = STATUS_CONFIGS[normalizedStatus];

        // For detailed styling (PengawasanSingleIin style)
        if (options.detailed && normalizedStatus === 'perbaikan') {
            return config!.badgeClass;
        }

        // Map to simpler colors for IinNasional style
        const simpleColorMap: Partial<Record<ApplicationStatus, string>> = {
            'pengajuan': 'bg-blue-100 text-blue-800 border-blue-200',
            'perbaikan': 'bg-red-100 text-red-800 border-red-200',
            'pembayaran': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'verifikasi-lapangan': 'bg-purple-100 text-purple-800 border-purple-200',
            'pembayaran-tahap-2': 'bg-orange-100 text-orange-800 border-orange-200',
            'terbit': 'bg-green-100 text-green-800 border-green-200'
        };

        return options.detailed ? config!.badgeClass : simpleColorMap[normalizedStatus]!;
    }

    return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Gets the display label for a given application status
 * @param status - The application status
 * @param options - Configuration options
 * @param options.detailed - Whether to use detailed labels (for SingleIin)
 * @returns Display label string
 */
export function getStatusLabel(
    status: string,
    options: { detailed?: boolean } = {}
): string {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus) {
        const config = STATUS_CONFIGS[normalizedStatus];
        return options.detailed && config!.detailedLabel ? config!.detailedLabel : config!.label;
    }

    return 'Tidak Diketahui';
}

/**
 * Gets the complete status configuration
 * @param status - The application status
 * @param options - Configuration options
 * @returns Complete status configuration or null if status not found
 */
export function getStatusConfig(
    status: string,
    options: { detailed?: boolean } = {}
): StatusConfig | null {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus) {
        const config = STATUS_CONFIGS[normalizedStatus];
        return {
            ...config,
            badgeClass: getStatusBadgeClass(status, options),
            label: getStatusLabel(status, options)
        };
    }

    return null;
}

/**
 * Gets all available status values
 * @returns Array of all supported status values
 */
export function getAllStatuses(): ApplicationStatus[] {
    return Object.keys(STATUS_CONFIGS) as ApplicationStatus[];
}