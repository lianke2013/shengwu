document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const birthdayInput = document.getElementById('birthday');
    const queryDateInput = document.getElementById('queryDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const physicalValue = document.getElementById('physicalValue');
    const emotionalValue = document.getElementById('emotionalValue');
    const intellectualValue = document.getElementById('intellectualValue');
    const maxPhysicalDate = document.getElementById('maxPhysicalDate');
    const maxEmotionalDate = document.getElementById('maxEmotionalDate');
    const maxIntellectualDate = document.getElementById('maxIntellectualDate');
    
    // 初始化图表
    const ctx = document.getElementById('biorhythmChart').getContext('2d');
    let biorhythmChart;

    // 定义辅助函数
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    function formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    function calculateBiorhythm(daysDiff, cycle) {
        return 50 + 50 * Math.sin(2 * Math.PI * (daysDiff % cycle) / cycle);
    }

    // 计算按钮点击事件
    calculateBtn.addEventListener('click', function() {
        const birthday = new Date(birthdayInput.value);
        const queryDate = new Date(queryDateInput.value);
        
        if (!birthdayInput.value || !queryDateInput.value) {
            alert('请输入出生日期和查询日期');
            return;
        }
        
        // 计算天数差
        const daysDiff = Math.floor((queryDate - birthday) / (1000 * 60 * 60 * 24));
        
        // 计算节律值
        const physical = calculateBiorhythm(daysDiff, 23);
        const emotional = calculateBiorhythm(daysDiff, 28);
        const intellectual = calculateBiorhythm(daysDiff, 33);
        
        // 更新显示
        physicalValue.textContent = physical.toFixed(2);
        emotionalValue.textContent = emotional.toFixed(2);
        intellectualValue.textContent = intellectual.toFixed(2);
        
        // 更新图表数据
        updateChart(birthday, queryDate);
    });

    // 更新图表数据
    function updateChart(birthday, queryDate) {
        const startDate = new Date(queryDateInput.value);
        const tempDate = new Date(startDate);
        tempDate.setDate(startDate.getDate() - 3);
        const startDateAdjusted = tempDate;

        const endDateAdjusted = new Date(startDate);
        endDateAdjusted.setDate(startDate.getDate() + 33);

        const labels = [];
        const physicalData = [];
        const emotionalData = [];
        const intellectualData = [];
        let queryDateIndex = -1;

        // 生成标签和数据
        for (let d = new Date(startDateAdjusted); d <= endDateAdjusted; d.setDate(d.getDate() + 1)) {
            const daysDiff = Math.floor((d - birthday) / (1000 * 60 * 60 * 24));
            const formattedDate = formatDate(d);

            labels.push(formattedDate);
            physicalData.push(calculateBiorhythm(daysDiff, 23));
            emotionalData.push(calculateBiorhythm(daysDiff, 28));
            intellectualData.push(calculateBiorhythm(daysDiff, 33));

            // 找到查询日期的索引
            if (queryDateIndex === -1 && isSameDate(d, queryDate)) {
                queryDateIndex = labels.length - 1;
            }
        }

        // 找出最大值对应日期
        findMaxDates(labels, physicalData, emotionalData, intellectualData);

        // 定义需要高亮的数据点索引
        let highlightIndexes = [];
        if (queryDateIndex !== -1) {
            highlightIndexes = [queryDateIndex, queryDateIndex, queryDateIndex]; // 对应三个数据集
        }

        // 如果图表未初始化，则进行初始化
        if (!biorhythmChart) {
            biorhythmChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: '体力节律',
                            data: physicalData,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            tension: 0.1,
                            borderWidth: 2,
                            datalabels: {
                                display: false // 默认不显示
                            }
                        },
                        {
                            label: '情绪节律',
                            data: emotionalData,
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            tension: 0.1,
                            borderWidth: 2,
                            datalabels: {
                                display: false // 默认不显示
                            }
                        },
                        {
                            label: '智力节律',
                            data: intellectualData,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.1)',
                            tension: 0.1,
                            borderWidth: 2,
                            datalabels: {
                                display: false // 默认不显示
                            }
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 10
                            }
                        }
                    },
                    plugins: {
                        annotation: {
                            annotations: []
                        },
                        datalabels: {
                            // 默认配置，可以在这里设置全局样式
                            color: 'black',
                            font: {
                                weight: 'bold',
                                size: 12
                            },
                            formatter: function(value, context) {
                                // 这里可以根据需要自定义格式
                                return value.toFixed(2);
                            }
                        }
                    }
                }
            });

            // 初始化 datalabels 插件
            biorhythmChart.options.plugins.datalabels = {
                // 默认不显示所有标签
                display: function(context) {
                    const index = context.dataIndex;
                    const datasetIndex = context.datasetIndex;
                    // 检查是否是查询日期的数据点
                    if (highlightIndexes.includes(index) && [0, 1, 2].includes(datasetIndex)) {
                        return true;
                    }
                    return false;
                },
                color: 'red', // 放大数值的颜色
                font: {
                    weight: 'bold',
                    size: 14 // 放大的字体大小
                },
                formatter: function(value, context) {
                    // 这里可以根据需要自定义格式
                    return value.toFixed(2);
                },
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // 背景色
                borderRadius: 4,
                padding: 4
            };
        } else {
            // 更新图表数据
            biorhythmChart.data.labels = labels;
            biorhythmChart.data.datasets[0].data = physicalData;
            biorhythmChart.data.datasets[1].data = emotionalData;
            biorhythmChart.data.datasets[2].data = intellectualData;

            // 更新 highlightIndexes
            if (queryDateIndex !== -1) {
                highlightIndexes = [queryDateIndex, queryDateIndex, queryDateIndex]; // 对应三个数据集
            } else {
                highlightIndexes = [];
            }

            // 动态更新 datalabels 配置
            biorhythmChart.options.plugins.datalabels.display = function(context) {
                const index = context.dataIndex;
                const datasetIndex = context.datasetIndex;
                if (highlightIndexes.includes(index) && [0, 1, 2].includes(datasetIndex)) {
                    return true;
                }
                return false;
            };

            biorhythmChart.update();
        }

        // 确保插件已配置
        if (!biorhythmChart.options.plugins) {
            biorhythmChart.options.plugins = {};
        }
        if (!biorhythmChart.options.plugins.annotation) {
            biorhythmChart.options.plugins.annotation = {
                annotations: []
            };
        }

        // 移除旧的竖线注释
        biorhythmChart.options.plugins.annotation.annotations = [];

        // 添加新的竖线注释
        if (queryDateIndex !== -1) {
            const queryDateLabel = labels[queryDateIndex];
            let value;
            for (let i = 0; i < labels.length; i++) {
                if (labels[i] === queryDateLabel) {
                    value = i;
                    break;
                }
            }

            biorhythmChart.options.plugins.annotation.annotations.push({
                type: 'line',
                mode: 'vertical',
                scaleID: 'x',
                value: queryDateLabel, // 使用日期字符串作为 value
                borderColor: 'red',
                borderWidth: 2,
                label: {
                    enabled: true,
                    content: '查询日期',
                    color: 'red'
                }
            });

            // 设置数据点颜色
            const highlightColor = 'rgba(255, 255, 0, 1)';
            biorhythmChart.data.datasets[0].pointBackgroundColor = Array(labels.length).fill('rgba(75, 192, 192, 0.5)');
            biorhythmChart.data.datasets[1].pointBackgroundColor = Array(labels.length).fill('rgba(75, 192, 192, 0.5)');
            biorhythmChart.data.datasets[2].pointBackgroundColor = Array(labels.length).fill('rgba(75, 192, 192, 0.5)');

            biorhythmChart.data.datasets[0].pointBackgroundColor[queryDateIndex] = highlightColor;
            biorhythmChart.data.datasets[1].pointBackgroundColor[queryDateIndex] = highlightColor;
            biorhythmChart.data.datasets[2].pointBackgroundColor[queryDateIndex] = highlightColor;
        }

        // 更新图表
        biorhythmChart.update();
    }

    // 找出最大值对应日期的函数
    function findMaxDates(labels, physicalData, emotionalData, intellectualData) {
        let maxPhysical = -Infinity;
        let maxEmotional = -Infinity;
        let maxIntellectual = -Infinity;
        let maxPhysicalDate = '';
        let maxEmotionalDate = '';
        let maxIntellectualDate = '';

        for (let i = 0; i < labels.length; i++) {
            if (physicalData[i] > maxPhysical) {
                maxPhysical = physicalData[i];
                maxPhysicalDate = labels[i];
            }
            if (emotionalData[i] > maxEmotional) {
                maxEmotional = emotionalData[i];
                maxEmotionalDate = labels[i];
            }
            if (intellectualData[i] > maxIntellectual) {
                maxIntellectual = intellectualData[i];
                maxIntellectualDate = labels[i];
            }
        }

        // 检查是否有多个相同最高值的日期
        const physicalDatesWithMax = labels.filter((date, index) => physicalData[index] === maxPhysical);
        const emotionalDatesWithMax = labels.filter((date, index) => emotionalData[index] === maxEmotional);
        const intellectualDatesWithMax = labels.filter((date, index) => intellectualData[index] === maxIntellectual);

        const finalMaxPhysicalDate = physicalDatesWithMax.length > 1
            ? `${physicalDatesWithMax.join('、')}（数值均为${maxPhysical.toFixed(2)}）`
            : `${maxPhysicalDate}（${maxPhysical.toFixed(2)}）`;
        const finalMaxEmotionalDate = emotionalDatesWithMax.length > 1
            ? `${emotionalDatesWithMax.join('、')}（数值均为${maxEmotional.toFixed(2)}）`
            : `${maxEmotionalDate}（${maxEmotional.toFixed(2)}）`;
        const finalMaxIntellectualDate = intellectualDatesWithMax.length > 1
            ? `${intellectualDatesWithMax.join('、')}（数值均为${maxIntellectual.toFixed(2)}）`
            : `${maxIntellectualDate}（${maxIntellectual.toFixed(2)}）`;

        document.getElementById('maxPhysicalDate').textContent = finalMaxPhysicalDate;
        document.getElementById('maxEmotionalDate').textContent = finalMaxEmotionalDate;
        document.getElementById('maxIntellectualDate').textContent = finalMaxIntellectualDate;
    }
});
