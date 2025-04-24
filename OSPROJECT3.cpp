#include <stdio.h>

#define MAX_PROCESSES 5

// Structure to store process details
typedef struct {
    int id;
    int burst_time;
    int priority;
    float power_consumption; // Power consumed per unit time
} Process;

// Function to sort processes by priority and power efficiency
void sortProcesses(Process p[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (p[j].priority < p[j + 1].priority || 
                (p[j].priority == p[j + 1].priority && p[j].power_consumption > p[j + 1].power_consumption)) {
                Process temp = p[j];
                p[j] = p[j + 1];
                p[j + 1] = temp;
            }
        }
    }
}

// Function to calculate total energy consumption
float calculateEnergy(Process p[], int n) {
    float total_energy = 0.0;
    int current_time = 0;
    for (int i = 0; i < n; i++) {
        total_energy += p[i].burst_time * p[i].power_consumption;
        current_time += p[i].burst_time;
        printf("Process %d executed (Priority: %d, Energy used: %.2f J)\n", p[i].id, p[i].priority, p[i].burst_time * p[i].power_consumption);
    }
    return total_energy;
}

int main() {
    Process processes[MAX_PROCESSES] = {
        {1, 6, 3, 1.5},
        {2, 2, 1, 0.8},
        {3, 8, 2, 1.2},
        {4, 3, 4, 1.0},
        {5, 4, 1, 0.5}
    };

    printf("Before Sorting:\n");
    for (int i = 0; i < MAX_PROCESSES; i++) {
        printf("Process %d | Burst Time: %d | Priority: %d | Power: %.2f J/s\n",
               processes[i].id, processes[i].burst_time, processes[i].priority, processes[i].power_consumption);
    }

    sortProcesses(processes, MAX_PROCESSES);

    printf("\nAfter Sorting (Power-Aware Priority Scheduling):\n");
    float total_energy = calculateEnergy(processes, MAX_PROCESSES);

    printf("\nTotal Energy Consumption: %.2f J\n", total_energy);

    return 0;
}

