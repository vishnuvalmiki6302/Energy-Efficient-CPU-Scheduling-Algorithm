#include <stdio.h>
#include <unistd.h>  // For sleep() function

// CPU Power States
#define MAX_FREQUENCY 3.0  // Maximum CPU frequency in GHz
#define MIN_FREQUENCY 0.5  // Minimum CPU frequency in GHz (Idle Mode)
#define IDLE_THRESHOLD 3   // Idle period threshold (in seconds)

// Function to simulate workload activity
int is_cpu_active(int current_time) {
    // Example logic: CPU is active every 5 seconds
    return (current_time % 5 != 0);
}

// Function to manage CPU frequency (DVFS logic)
void manage_cpu_power(int current_time) {
    static int idle_time = 0;  // Tracks consecutive idle periods
    static double current_frequency = MAX_FREQUENCY;

    if (is_cpu_active(current_time)) {
        if (current_frequency != MAX_FREQUENCY) {
            current_frequency = MAX_FREQUENCY;
            printf("[Time %d] CPU is active. Restoring frequency to %.1f GHz\n", 
                   current_time, current_frequency);
        }
        idle_time = 0;  // Reset idle counter when CPU becomes active
    } else {
        idle_time++;
        if (idle_time >= IDLE_THRESHOLD) {
            if (current_frequency != MIN_FREQUENCY) {
                current_frequency = MIN_FREQUENCY;
                printf("[Time %d] CPU is idle. Lowering frequency to %.1f GHz\n", 
                       current_time, current_frequency);
            }
        }
    }
}

// Main simulation function
int main() {
    int total_time = 20;  // Total simulation time in seconds

    printf("Starting CPU Power Management Simulation...\n");

    for (int time = 1; time <= total_time; time++) {
        manage_cpu_power(time);
        sleep(1);  // Simulate real-time clock
    }

    printf("Simulation finished.\n");
    return 0;
}

