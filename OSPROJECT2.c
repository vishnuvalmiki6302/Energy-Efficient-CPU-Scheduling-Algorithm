#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> // For usleep()

#define MAX_TASKS 5
#define MAX_FREQUENCY 2.0   // GHz
#define MID_FREQUENCY 1.5   // GHz
#define MIN_FREQUENCY 0.8   // GHz
#define IDLE_POWER 0.3      // Watts during idle
#define BASE_POWER 1.2      // Watts at max frequency

typedef struct {
    int id;
    int execution_time; // in ms
    int workload;       // Workload percentage (0-100)
} Task;

// Adaptive DVFS: Adjust frequency based on workload
double adaptive_dvfs(int workload) {
    if (workload > 75)
        return MAX_FREQUENCY;
    else if (workload > 50)
        return MID_FREQUENCY;
    else
        return MIN_FREQUENCY;
}

// Power Calculation
double calculate_power(double frequency, int is_idle) {
    if (is_idle)
        return IDLE_POWER;
    else
        return BASE_POWER * (frequency / MAX_FREQUENCY);
}

// CPU Scheduling Simulation
void schedule_tasks(Task tasks[], int n) {
    int i;
    printf("Starting Adaptive DVFS Scheduling...\n");

    for (i = 0; i < n; i++) {
        double frequency = adaptive_dvfs(tasks[i].workload);
        double power = calculate_power(frequency, 0);

        printf("Task %d | Workload: %d%% | Exec Time: %d ms | Frequency: %.1f GHz | Power: %.2f W\n",
               tasks[i].id, tasks[i].workload, tasks[i].execution_time, frequency, power);

        usleep(tasks[i].execution_time * 1000); // Simulate task execution
    }

    printf("System entering idle state...\n");
    printf("Idle Power Consumption: %.2f W\n", calculate_power(MIN_FREQUENCY, 1));
}

int main() {
    Task tasks[MAX_TASKS] = {
        {1, 200, 80},   // High workload
        {2, 100, 60},   // Medium workload
        {3, 300, 40},   // Low workload
        {4, 150, 20},   // Very low workload
        {5, 250, 90}    // Heavy workload
    };

    schedule_tasks(tasks, MAX_TASKS);

    return 0;
}
