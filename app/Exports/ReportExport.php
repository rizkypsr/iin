<?php

namespace App\Exports;

use App\Models\IinNasionalApplication;
use App\Models\IinSingleBlockholderApplication;
use App\Models\PengawasanIinNasional;
use App\Models\PengawasanSingleIin;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $type;

    public function __construct($type = 'all')
    {
        $this->type = $type;
    }

    public function collection()
    {
        $reports = collect();

        if ($this->type === 'iin_nasional') {
            $iinNasional = IinNasionalApplication::with('user')
                ->where('status', 'terbit')
                ->get()
                ->map(function ($item) {
                    return (object)[
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'IIN Nasional',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? (int)max(0, $item->created_at->diffInDays($item->issued_at))
                            : 0,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($iinNasional);
        }

        if ($this->type === 'single_iin') {
            $singleIin = IinSingleBlockholderApplication::with('user')
                ->where('status', 'terbit')
                ->get()
                ->map(function ($item) {
                    return (object)[
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Single IIN Blockholder',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? (int)max(0, $item->created_at->diffInDays($item->issued_at))
                            : 0,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($singleIin);
        }

        if ($this->type === 'pengawasan_iin') {
            $pengawasanIin = PengawasanIinNasional::with(['user', 'iinNasionalProfile'])
                ->where('status', 'terbit')
                ->get()
                ->map(function ($item) {
                    return (object)[
                        'company_name' => $item->iinNasionalProfile->institution_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Pengawasan IIN Nasional',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? (int)max(0, $item->created_at->diffInDays($item->issued_at))
                            : 0,
                        'iin_number' => $item->iinNasionalProfile->iin_national_assignment,
                        'pic_name' => $item->iinNasionalProfile->contact_person_name,
                        'company_phone' => $item->iinNasionalProfile->company_person_phone,
                        'email' => $item->iinNasionalProfile->contact_person_email,
                    ];
                });
            $reports = $reports->merge($pengawasanIin);
        }

        if ($this->type === 'pengawasan_single_iin') {
            $pengawasanIin = PengawasanSingleIin::with(['user', 'singleIinProfile'])
                ->where('status', 'terbit')
                ->get()
                ->map(function ($item) {
                    return (object)[
                        'company_name' => $item->singleIinProfile->institution_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Pengawasan Single IIN Blockholder',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? (int)max(0, $item->created_at->diffInDays($item->issued_at))
                            : 0,
                        'iin_number' => $item->singleIinProfile->iin_assignment,
                        'pic_name' => $item->singleIinProfile->contact_person,
                        'company_phone' => $item->singleIinProfile->phone_fax_updated,
                        'email' => $item->singleIinProfile->email,
                    ];
                });
            $reports = $reports->merge($pengawasanIin);
        }

        // Sort by created_at descending
        return $reports->sortByDesc('created_at')->values();
    }

    public function headings(): array
    {
        return [
            'Nama Instansi',
            'Tanggal Pengajuan',
            'Jenis Layanan',
            'Tanggal Bayar',
            'Nominal Pembayaran',
            'Tanggal Nomor Keluar',
            'Jumlah Hari Layanan',
            'Nomor Single IIN/NNS',
            'Nama PIC Perusahaan',
            'No HP PIC Perusahaan',
            'Email',
        ];
    }

    public function map($row): array
    {
        return [
            $row->company_name,
            $row->created_at ? $row->created_at->format('d/m/Y') : '',
            $row->service_type,
            $row->payment_proof_uploaded_at ? $row->payment_proof_uploaded_at->format('d/m/Y') : '',
            $row->nominal_pembayaran,
            $row->issued_at ? $row->issued_at->format('d/m/Y') : '',
            $row->service_days,
            $row->iin_number,
            $row->pic_name,
            $row->company_phone,
            $row->email,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}
