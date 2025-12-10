<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\IinNasionalApplication;
use App\Models\IinSingleBlockholderApplication;

final class ApplicationCountService
{
    public function getNewApplicationCounts(): array
    {
        return [
            'iin_nasional' => $this->getNewIinNasionalCount(),
            'iin_single_blockholder' => $this->getNewIinSingleBlockholderCount(),
        ];
    }

    private function getNewIinNasionalCount(): int
    {
        return IinNasionalApplication::where('status', 'pengajuan')->count();
    }

    private function getNewIinSingleBlockholderCount(): int
    {
        return IinSingleBlockholderApplication::where('status', 'pengajuan')->count();
    }
}
