#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>  // For sleep function
#include <time.h>    // For timestamp

#define MAX_TEMP 75 // Maximum safe temperature in Celsius
#define CRITICAL_TEMP 85 // Critical temperature threshold
#define COOLING_THRESHOLD 65 // Threshold to restore CPU performance

// Simulated function to read temperature from sensor (e.g., /sys/class/thermal in Linux)
int read_temperature() {
    // In a real system, you would access hardware sensors.
    // This simulated function randomly generates temperatures for demonstration.
    return rand() % 100; 
}

// Function to log temperature data with timestamps
void log_temperature(int temp) {
    FILE *logFile = fopen("temperature_log.txt", "a");
    if (logFile != NULL) {
        time_t now = time(NULL);
        fprintf(logFile, "%s - Current Temperature: %d�C\n", ctime(&now), temp);
        fclose(logFile);
    }
}

// Function to reduce CPU load or frequency
void reduce_cpu_frequency() {
    printf("[ALERT] High temperature detected! Reducing CPU frequency to lower heat.\n");
    // System command example for Linux-based systems:
    // system("echo 1000000 > /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq");
}

// Function to restore CPU frequency when temperature is safe
void restore_cpu_frequency() {
    printf("[INFO] Temperature stabilized. Restoring CPU frequency.\n");
    // System command example for Linux-based systems:
    // system("echo 2000000 > /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq");
}

// Function to shut down the system in critical conditions
void shutdown_device() {
    printf("[CRITICAL] Critical temperature reached! Shutting down device to prevent damage.\n");
    // In a real system, implement safe shutdown routines here.
    exit(EXIT_FAILURE);
}

int main() {
    printf("Starting Thermal Management System...\n");

    int cpu_throttled = 0; // Flag to track CPU throttling status

    while (1) {
        int current_temp = read_temperature();
        log_temperature(current_temp);
        printf("Current Temperature: %d�C\n", current_temp);

        if (current_temp >= CRITICAL_TEMP) {
            shutdown_device();
        } else if (current_temp >= MAX_TEMP) {
            if (!cpu_throttled) {
                reduce_cpu_frequency();
                cpu_throttled = 1;
            }
        } else if (cpu_throttled && current_temp <= COOLING_THRESHOLD) {
            restore_cpu_frequency();
            cpu_throttled = 0;
        } else {
            printf("[INFO] Temperature is within safe limits.\n");
        }

        sleep(5); // Check temperature every 5 seconds (adjust as needed)
    }

    return 0;
}
