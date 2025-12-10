<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class DocumentRequirement extends Model
{
    protected $fillable = [
        'type',
        'content',
    ];

    protected $casts = [
        'type' => 'string',
        'content' => 'string',
    ];

    public const TYPE_IIN_NASIONAL = 'iin_nasional';

    public const TYPE_IIN_SINGLE_BLOCKHOLDER = 'iin_single_blockholder';

    public static function getByType(string $type): ?self
    {
        return self::where('type', $type)->first();
    }

    public static function getIinNasionalRequirements(): ?self
    {
        return self::getByType(self::TYPE_IIN_NASIONAL);
    }

    public static function getIinSingleBlockholderRequirements(): ?self
    {
        return self::getByType(self::TYPE_IIN_SINGLE_BLOCKHOLDER);
    }
}
