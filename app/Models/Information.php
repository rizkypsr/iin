<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

final class Information extends Model
{
    protected $table = 'informations';

    protected $fillable = [
        'title',
        'image',
        'content',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['excerpt'];

    public function getExcerptAttribute(): string
    {
        return Str::limit(strip_tags($this->content), 150);
    }

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->latest()->first();
    }

    public static function getAllActive(): Collection
    {
        return self::where('is_active', true)->latest()->get();
    }
}
