package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client

// InitRedis menginisialisasi Redis client
func InitRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: redisURL,
	})

	// Test connection dengan timeout
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Warning: Redis tidak tersedia (%v). Cache akan dilewati.\n", err)
		RedisClient = nil
	} else {
		fmt.Println("Redis connected successfully")
	}
}

// GetCache mengambil data dari Redis cache
func GetCache(key string) (interface{}, error) {
	if RedisClient == nil {
		return nil, fmt.Errorf("redis client not available")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	val, err := RedisClient.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Cache miss
		}
		return nil, err
	}

	// Parse JSON dari string
	var data interface{}
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, err
	}

	return data, nil
}

// SetCache menyimpan data ke Redis cache dengan TTL
func SetCache(key string, data interface{}, ttl time.Duration) error {
	if RedisClient == nil {
		return fmt.Errorf("redis client not available")
	}

	// Convert data ke JSON string
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return RedisClient.Set(ctx, key, string(jsonData), ttl).Err()
}

// DeleteCache menghapus data dari Redis cache
func DeleteCache(key string) error {
	if RedisClient == nil {
		return fmt.Errorf("redis client not available")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return RedisClient.Del(ctx, key).Err()
}

// CloseRedis menutup koneksi Redis
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}
