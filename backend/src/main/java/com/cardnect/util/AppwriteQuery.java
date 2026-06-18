package com.cardnect.util;

import java.util.UUID;

public class AppwriteQuery {

    public static String equal(String attribute, String value) {
        return "{\"method\":\"equal\",\"attribute\":\"" + attribute + "\",\"values\":[\"" + value + "\"]}";
    }

    public static String equal(String attribute, UUID value) {
        return "{\"method\":\"equal\",\"attribute\":\"" + attribute + "\",\"values\":[\"" + value.toString() + "\"]}";
    }

    public static String equal(String attribute, java.util.List<String> values) {
        String joined = values.stream()
                .map(v -> "\"" + v + "\"")
                .collect(java.util.stream.Collectors.joining(","));
        return "{\"method\":\"equal\",\"attribute\":\"" + attribute + "\",\"values\":[" + joined + "]}";
    }

    public static String equal(String attribute, boolean value) {
        return "{\"method\":\"equal\",\"attribute\":\"" + attribute + "\",\"values\":[" + value + "]}";
    }

    public static String equal(String attribute, int value) {
        return "{\"method\":\"equal\",\"attribute\":\"" + attribute + "\",\"values\":[" + value + "]}";
    }

    public static String orderDesc(String attribute) {
        return "{\"method\":\"orderDesc\",\"attribute\":\"" + attribute + "\"}";
    }

    public static String limit(int limit) {
        return "{\"method\":\"limit\",\"values\":[" + limit + "]}";
    }
}
