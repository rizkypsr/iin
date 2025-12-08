<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

final class FormTemplate extends Model
{
    protected $fillable = [
        'type',
        'name',
        'file_path',
        'original_name',
        'order',
    ];

    public const TYPE_NASIONAL = 'nasional';
    public const TYPE_SINGLE_BLOCKHOLDER = 'single-blockholder';

    public static function getByType(string $type): Collection
    {
        return self::where('type', $type)->orderBy('order')->get();
    }

    public static function getNasionalForms(): Collection
    {
        return self::getByType(self::TYPE_NASIONAL);
    }

    public static function getSingleBlockholderForms(): Collection
    {
        return self::getByType(self::TYPE_SINGLE_BLOCKHOLDER);
    }
}
