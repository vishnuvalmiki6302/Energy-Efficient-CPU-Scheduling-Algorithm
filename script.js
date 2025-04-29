// Task class for the demo
class Task {
    constructor(id, burstTime, deadline, priority) {
        this.id = id;
        this.burstTime = burstTime;
        this.deadline = deadline;
        this.priority = priority;
        this.remainingTime = burstTime;
        this.energyConsumed = 0;
        this.state = 'READY';
        this.startTime = 0;
        this.endTime = 0;
        this.frequencyUsed = 0;
    }
}

// Scheduler class for the demo
class Scheduler {
    constructor() {
        this.tasks = [];
        this.currentTime = 0;
        this.totalEnergy = 0;
        this.maxFrequency = 1.0;
        this.minFrequency = 0.4;
        this.currentFrequency = 1.0;
        this.isRunning = false;
        this.executionHistory = [];
        this.charts = {
            energy: null,
            frequency: null,
            timeline: null,
            efficiency: null
        };
        this.initializeCharts();
    }

    initializeCharts() {
        // Energy Consumption Chart
        this.charts.energy = new Chart(document.getElementById('energyChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Energy Consumption',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Energy (units)'
                        }
                    }
                }
            }
        });

        // CPU Frequency Chart
        this.charts.frequency = new Chart(document.getElementById('frequencyChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU Frequency',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        min: this.minFrequency,
                        max: this.maxFrequency,
                        title: {
                            display: true,
                            text: 'Frequency'
                        }
                    }
                }
            }
        });

        // Timeline Chart
        this.charts.timeline = new Chart(document.getElementById('timelineChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Task Duration',
                    data: [],
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (s)'
                        }
                    }
                }
            }
        });

        // Efficiency Chart
        this.charts.efficiency = new Chart(document.getElementById('efficiencyChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Energy Efficiency',
                    data: [],
                    borderColor: '#f1c40f',
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Efficiency (units/s)'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update Energy Chart
        this.charts.energy.data.labels = this.executionHistory.map(step => step.time.toFixed(2));
        this.charts.energy.data.datasets[0].data = this.executionHistory.map(step => step.energy);
        this.charts.energy.update();

        // Update Frequency Chart
        this.charts.frequency.data.labels = this.executionHistory.map(step => step.time.toFixed(2));
        this.charts.frequency.data.datasets[0].data = this.executionHistory.map(step => step.frequency);
        this.charts.frequency.update();

        // Update Timeline Chart
        const completedTasks = this.tasks.filter(t => t.state === 'COMPLETED');
        this.charts.timeline.data.labels = completedTasks.map(t => `Task ${t.id}`);
        this.charts.timeline.data.datasets[0].data = completedTasks.map(t => t.endTime - t.startTime);
        this.charts.timeline.update();

        // Update Efficiency Chart
        const efficiencyData = this.executionHistory.map((step, index) => {
            if (index === 0) return 0;
            const timeDiff = step.time - this.executionHistory[index - 1].time;
            return timeDiff > 0 ? step.energy / timeDiff : 0;
        });
        this.charts.efficiency.data.labels = this.executionHistory.map(step => step.time.toFixed(2));
        this.charts.efficiency.data.datasets[0].data = efficiencyData;
        this.charts.efficiency.update();
    }

    addTask(task) {
        this.tasks.push(task);
        this.updateDisplay();
    }

    calculateEnergyConsumption(frequency, executionTime) {
        return Math.pow(frequency, 3) * executionTime;
    }

    adjustFrequency(task) {
        if (task.deadline - this.currentTime < task.remainingTime) {
            return this.maxFrequency;
        } else {
            const slackTime = task.deadline - this.currentTime - task.remainingTime;
            if (slackTime > 0) {
                const scaledFreq = this.maxFrequency * 0.7;
                return Math.max(this.minFrequency, scaledFreq);
            }
            return this.maxFrequency;
        }
    }

    async schedule() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.executionHistory = [];

        // Sort tasks by priority
        this.tasks.sort((a, b) => a.priority - b.priority);
        
        for (const task of this.tasks) {
            task.startTime = this.currentTime;
            this.currentFrequency = this.adjustFrequency(task);
            const executionTime = task.remainingTime / this.currentFrequency;
            
            task.state = 'RUNNING';
            task.frequencyUsed = this.currentFrequency;
            task.energyConsumed = this.calculateEnergyConsumption(
                this.currentFrequency, executionTime
            );
            this.totalEnergy += task.energyConsumed;
            
            // Record execution step
            this.executionHistory.push({
                time: this.currentTime,
                taskId: task.id,
                frequency: this.currentFrequency,
                energy: task.energyConsumed
            });
            
            // Update display during execution
            this.updateDisplay();
            
            // Simulate execution with a delay
            await new Promise(resolve => setTimeout(resolve, executionTime * 1000));
            
            this.currentTime += executionTime;
            task.endTime = this.currentTime;
            task.remainingTime = 0;
            task.state = 'COMPLETED';
            
            // Update display after completion
            this.updateDisplay();
        }
        
        // Update charts after each task completion
        this.updateCharts();
        
        this.isRunning = false;
    }

    getTaskStatistics() {
        const completedTasks = this.tasks.filter(t => t.state === 'COMPLETED');
        const totalExecutionTime = this.currentTime;
        const averageEnergy = this.totalEnergy / completedTasks.length;
        const energyEfficiency = this.totalEnergy / totalExecutionTime;

        return {
            totalTasks: this.tasks.length,
            completedTasks: completedTasks.length,
            totalExecutionTime,
            averageEnergy,
            energyEfficiency,
            executionHistory: this.executionHistory
        };
    }

    updateDisplay() {
        const queueContent = document.getElementById('queueContent');
        const statsContent = document.getElementById('statsContent');
        const historyContent = document.getElementById('historyContent');
        const stats = this.getTaskStatistics();
        
        // Update task queue display with visual indicators
        queueContent.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.state.toLowerCase()}">
                <div class="task-header">
                    <h4>Task ${task.id}</h4>
                    <span class="priority-badge">Priority ${task.priority}</span>
                </div>
                <div class="task-details">
                    <p class="state-indicator">State: <span class="state-${task.state.toLowerCase()}">${task.state}</span></p>
                    <p>Remaining Time: ${task.remainingTime.toFixed(2)}</p>
                    <p>Energy Consumed: ${task.energyConsumed.toFixed(2)} units</p>
                    ${task.state === 'COMPLETED' ? `
                        <p>Frequency Used: ${task.frequencyUsed.toFixed(2)}</p>
                        <p>Execution Time: ${(task.endTime - task.startTime).toFixed(2)}</p>
                    ` : ''}
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${((task.burstTime - task.remainingTime) / task.burstTime) * 100}%"></div>
                </div>
            </div>
        `).join('');
        
        // Update energy statistics
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Energy Consumption</h4>
                    <p>Total: ${this.totalEnergy.toFixed(2)} units</p>
                    <p>Average per Task: ${stats.averageEnergy.toFixed(2)} units</p>
                    <p>Efficiency: ${stats.energyEfficiency.toFixed(2)} units/time</p>
                </div>
                <div class="stat-card">
                    <h4>Performance</h4>
                    <p>Current Frequency: ${this.currentFrequency.toFixed(2)}</p>
                    <p>Tasks Completed: ${stats.completedTasks}/${stats.totalTasks}</p>
                    <p>Total Time: ${stats.totalExecutionTime.toFixed(2)}</p>
                </div>
            </div>
        `;

        // Update execution history
        historyContent.innerHTML = `
            <h4>Execution History</h4>
            <div class="history-timeline">
                ${stats.executionHistory.map(step => `
                    <div class="timeline-item">
                        <span class="time">${step.time.toFixed(2)}s</span>
                        <span class="task">Task ${step.taskId}</span>
                        <span class="frequency">Freq: ${step.frequency.toFixed(2)}</span>
                        <span class="energy">Energy: ${step.energy.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        
        this.updateCharts();
    }
}

const scheduler = new Scheduler();

document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskId = parseInt(document.getElementById('taskId').value);
    const burstTime = parseFloat(document.getElementById('burstTime').value);
    const deadline = parseFloat(document.getElementById('deadline').value);
    const priority = parseInt(document.getElementById('priority').value);
    
    const task = new Task(taskId, burstTime, deadline, priority);
    scheduler.addTask(task);
    
    // Clear form
    e.target.reset();
});

// Add Run Scheduler button
const runButton = document.createElement('button');
runButton.textContent = 'Run Scheduler';
runButton.id = 'runScheduler';
runButton.style.marginTop = '1rem';
document.querySelector('.task-input').appendChild(runButton);

// Handle Run Scheduler button click
document.getElementById('runScheduler').addEventListener('click', () => {
    scheduler.schedule();
});

// Handle code tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.code-block').forEach(block => block.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}Code`).classList.add('active');
    });
});

 