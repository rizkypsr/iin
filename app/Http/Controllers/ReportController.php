<?php

namespace App\Http\Controllers;

use App\Exports\ReportExport;
use App\Models\IinNasionalApplication;
use App\Models\IinSingleBlockholderApplication;
use App\Models\PengawasanIinNasional;
use App\Models\PengawasanSingleIin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'all');

        $reports = collect();

        if ($type === 'all' || $type === 'iin_nasional') {
            $iinNasional = IinNasionalApplication::with('user')
                ->get()
                ->map(function ($item) {
                    return [
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'IIN Nasional',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? $item->created_at->diffInDays($item->issued_at)
                            : null,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($iinNasional);
        }

        if ($type === 'all' || $type === 'single_iin') {
            $singleIin = IinSingleBlockholderApplication::with('user')
                ->get()
                ->map(function ($item) {
                    return [
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Single IIN Blockholder',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? $item->created_at->diffInDays($item->issued_at)
                            : null,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($singleIin);
        }

        if ($type === 'all' || $type === 'pengawasan_iin') {
            $pengawasanIin = PengawasanIinNasional::with('user')
                ->get()
                ->map(function ($item) {
                    return [
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Pengawasan IIN Nasional',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? $item->created_at->diffInDays($item->issued_at)
                            : null,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($pengawasanIin);
        }

        if ($type === 'all' || $type === 'pengawasan_single_iin') {
            $pengawasanSingleIin = PengawasanSingleIin::with('user')
                ->get()
                ->map(function ($item) {
                    return [
                        'company_name' => $item->user->company_name,
                        'created_at' => $item->created_at,
                        'service_type' => 'Pengawasan Single IIN',
                        'payment_proof_uploaded_at' => $item->payment_proof_uploaded_at,
                        'nominal_pembayaran' => 0,
                        'issued_at' => $item->issued_at,
                        'service_days' => $item->issued_at && $item->created_at
                            ? $item->created_at->diffInDays($item->issued_at)
                            : null,
                        'iin_number' => $item->iin_number,
                        'pic_name' => $item->user->name,
                        'company_phone' => $item->user->company_phone,
                        'email' => $item->user->email,
                    ];
                });
            $reports = $reports->merge($pengawasanSingleIin);
        }

        // Sort by created_at descending
        $reports = $reports->sortByDesc('created_at')->values();

        return Inertia::render('admin/Reports/Index', [
            'reports' => $reports,
            'currentType' => $type,
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->get('type', 'all');

        return Excel::download(new ReportExport($type), 'laporan-iin-'.date('Y-m-d').'.xlsx');
    }
}
