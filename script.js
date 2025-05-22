      // Estrutura de dados inicial
        let data = {
            cnpjs: [],
            stores: ["Shopee", "Shein", "Mercado Livre", "Magalu"]
        };

        // Variáveis para armazenar os gráficos
        let revenueByCnpjChart = null;
        let revenueByStoreChart = null;
        let ordersByStoreChart = null;
        let returnsByStoreChart = null;

        // Cores para os gráficos
        const chartColors = [
            'rgba(59, 130, 246, 0.7)', // Azul
            'rgba(16, 185, 129, 0.7)', // Verde
            'rgba(239, 68, 68, 0.7)',  // Vermelho
            'rgba(245, 158, 11, 0.7)', // Laranja
            'rgba(139, 92, 246, 0.7)', // Roxo
            'rgba(236, 72, 153, 0.7)', // Rosa
            'rgba(75, 85, 99, 0.7)',   // Cinza
            'rgba(14, 165, 233, 0.7)', // Azul claro
            'rgba(168, 85, 247, 0.7)', // Roxo claro
            'rgba(249, 115, 22, 0.7)'  // Laranja escuro
        ];

        // Função para formatar valores monetários
        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        // Função para atualizar a data atual
        function updateCurrentDate() {
            const monthSelector = document.getElementById('monthSelector');
            const selectedMonth = parseInt(monthSelector.value);
            
            const now = new Date();
            const year = now.getFullYear();
            const date = new Date(year, selectedMonth, 1);
            
            const options = { month: 'long', year: 'numeric' };
            document.getElementById('currentDate').textContent = `Relatório referente a ${date.toLocaleDateString('pt-BR', options)}`;
        }

        // Função para calcular e exibir os totais
        function calculateTotals() {
            let totalRevenue = 0;
            let totalReturns = 0;
            let totalOrders = 0;
            
            // Detalhes para os cards
            let revenueDetails = [];
            let returnsDetails = [];
            let ordersDetails = [];
            
            // Calcular totais por CNPJ
            data.cnpjs.forEach(cnpj => {
                let cnpjRevenue = 0;
                let cnpjReturns = 0;
                let cnpjOrders = 0;
                
                cnpj.stores.forEach(store => {
                    cnpjRevenue += parseFloat(store.revenue) || 0;
                    cnpjReturns += parseFloat(store.returns) || 0;
                    cnpjOrders += parseInt(store.orders) || 0;
                });
                
                totalRevenue += cnpjRevenue;
                totalReturns += cnpjReturns;
                totalOrders += cnpjOrders;
                
                // Adicionar detalhes se o valor for significativo
                if (cnpjRevenue > 0) {
                    revenueDetails.push(`${cnpj.name}: ${formatCurrency(cnpjRevenue)}`);
                }
                if (cnpjReturns > 0) {
                    returnsDetails.push(`${cnpj.name}: ${formatCurrency(cnpjReturns)}`);
                }
                if (cnpjOrders > 0) {
                    ordersDetails.push(`${cnpj.name}: ${cnpjOrders}`);
                }
            });
            
            const netRevenue = totalRevenue - totalReturns;
            
            // Exibir totais
            document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
            document.getElementById('totalReturns').textContent = formatCurrency(totalReturns);
            document.getElementById('netRevenue').textContent = formatCurrency(netRevenue);
            document.getElementById('totalOrders').textContent = totalOrders.toLocaleString('pt-BR');
            
            // Exibir detalhes
            document.getElementById('totalRevenueDetail').textContent = revenueDetails.slice(0, 2).join(' | ');
            document.getElementById('totalReturnsDetail').textContent = returnsDetails.slice(0, 2).join(' | ');
            document.getElementById('netRevenueDetail').textContent = `${Math.round((netRevenue/totalRevenue)*100)}% do faturamento bruto`;
            document.getElementById('totalOrdersDetail').textContent = ordersDetails.slice(0, 2).join(' | ');
            
            return { totalRevenue, totalReturns, netRevenue, totalOrders };
        }

        // Função para preencher a tabela de CNPJs
        function populateCnpjTable() {
            const tableBody = document.getElementById('cnpjTableBody');
            tableBody.innerHTML = '';
            
            const totals = calculateTotals();
            
            data.cnpjs.forEach(cnpj => {
                let cnpjRevenue = 0;
                let cnpjReturns = 0;
                let cnpjOrders = 0;
                
                cnpj.stores.forEach(store => {
                    cnpjRevenue += parseFloat(store.revenue) || 0;
                    cnpjReturns += parseFloat(store.returns) || 0;
                    cnpjOrders += parseInt(store.orders) || 0;
                });
                
                const cnpjNetRevenue = cnpjRevenue - cnpjReturns;
                const percentOfTotal = totals.totalRevenue > 0 ? (cnpjRevenue / totals.totalRevenue * 100).toFixed(1) : 0;
                
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="py-3 px-4">${cnpj.id}</td>
                    <td class="py-3 px-4">${cnpj.name}</td>
                    <td class="py-3 px-4 text-right">${formatCurrency(cnpjRevenue)}</td>
                    <td class="py-3 px-4 text-right">${formatCurrency(cnpjReturns)}</td>
                    <td class="py-3 px-4 text-right">${formatCurrency(cnpjNetRevenue)}</td>
                    <td class="py-3 px-4 text-right">${cnpjOrders.toLocaleString('pt-BR')}</td>
                    <td class="py-3 px-4 text-right">${percentOfTotal}%</td>
                `;
                
                tableBody.appendChild(row);
            });
        }

        // Função para preencher a tabela de lojas
        function populateStoreTable() {
            const tableBody = document.getElementById('storeTableBody');
            tableBody.innerHTML = '';
            
            data.cnpjs.forEach(cnpj => {
                cnpj.stores.forEach(store => {
                    const revenue = parseFloat(store.revenue) || 0;
                    const returns = parseFloat(store.returns) || 0;
                    const orders = parseInt(store.orders) || 0;
                    const netRevenue = revenue - returns;
                    const ticketMedio = orders > 0 ? revenue / orders : 0;
                    
                    const row = document.createElement('tr');
                    row.className = 'border-b hover:bg-gray-50';
                    row.innerHTML = `
                        <td class="py-3 px-4">${cnpj.id}</td>
                        <td class="py-3 px-4">${store.name}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(revenue)}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(returns)}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(netRevenue)}</td>
                        <td class="py-3 px-4 text-right">${orders.toLocaleString('pt-BR')}</td>
                        <td class="py-3 px-4 text-right">${formatCurrency(ticketMedio)}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
            });
        }

        // Função para criar o gráfico de faturamento por CNPJ
        function createRevenueByCnpjChart() {
            const ctx = document.getElementById('revenueByCnpjChart').getContext('2d');
            
            const cnpjLabels = data.cnpjs.map(cnpj => cnpj.name);
            const revenueData = data.cnpjs.map(cnpj => {
                return cnpj.stores.reduce((total, store) => total + (parseFloat(store.revenue) || 0), 0);
            });
            const returnsData = data.cnpjs.map(cnpj => {
                return cnpj.stores.reduce((total, store) => total + (parseFloat(store.returns) || 0), 0);
            });
            const netRevenueData = revenueData.map((revenue, index) => revenue - returnsData[index]);
            
            if (revenueByCnpjChart) {
                revenueByCnpjChart.destroy();
            }
            
            revenueByCnpjChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: cnpjLabels,
                    datasets: [
                        {
                            label: 'Faturamento Bruto',
                            data: revenueData,
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 1
                        },
                        {
                            label: 'Faturamento Líquido',
                            data: netRevenueData,
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + formatCurrency(context.raw);
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            color: '#fff',
                            font: {
                                weight: 'bold'
                            },
                            formatter: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            });
        }

        // Função para criar o gráfico de faturamento por loja
        function createRevenueByStoreChart() {
            const ctx = document.getElementById('revenueByStoreChart').getContext('2d');
            
            // Agrupar dados por loja
            const storeData = {};
            data.cnpjs.forEach(cnpj => {
                cnpj.stores.forEach(store => {
                    if (!storeData[store.name]) {
                        storeData[store.name] = { revenue: 0, returns: 0 };
                    }
                    storeData[store.name].revenue += parseFloat(store.revenue) || 0;
                    storeData[store.name].returns += parseFloat(store.returns) || 0;
                });
            });
            
            const storeNames = Object.keys(storeData);
            const revenueData = storeNames.map(name => storeData[name].revenue);
            const netRevenueData = storeNames.map(name => storeData[name].revenue - storeData[name].returns);
            
            if (revenueByStoreChart) {
                revenueByStoreChart.destroy();
            }
            
            revenueByStoreChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: storeNames,
                    datasets: [
                        {
                            label: 'Faturamento Bruto',
                            data: revenueData,
                            backgroundColor: storeNames.map((_, i) => chartColors[i % chartColors.length]),
                            borderColor: storeNames.map((_, i) => chartColors[i % chartColors.length].replace('0.7', '1')),
                            borderWidth: 1
                        },
                        {
                            label: 'Faturamento Líquido',
                            data: netRevenueData,
                            backgroundColor: storeNames.map((_, i) => chartColors[(i + 5) % chartColors.length]),
                            borderColor: storeNames.map((_, i) => chartColors[(i + 5) % chartColors.length].replace('0.7', '1')),
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + formatCurrency(context.raw);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Função para criar o gráfico de pedidos por loja
        function createOrdersByStoreChart() {
            const ctx = document.getElementById('ordersByStoreChart').getContext('2d');
            
            // Agrupar dados por loja
            const storeData = {};
            data.cnpjs.forEach(cnpj => {
                cnpj.stores.forEach(store => {
                    if (!storeData[store.name]) {
                        storeData[store.name] = { orders: 0 };
                    }
                    storeData[store.name].orders += parseInt(store.orders) || 0;
                });
            });
            
            const storeNames = Object.keys(storeData);
            const ordersData = storeNames.map(name => storeData[name].orders);
            
            if (ordersByStoreChart) {
                ordersByStoreChart.destroy();
            }
            
            ordersByStoreChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: storeNames,
                    datasets: [
                        {
                            data: ordersData,
                            backgroundColor: storeNames.map((_, i) => chartColors[i % chartColors.length]),
                            borderColor: storeNames.map((_, i) => chartColors[i % chartColors.length].replace('0.7', '1')),
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${context.label}: ${value.toLocaleString('pt-BR')} pedidos (${percentage}%)`;
                                }
                            }
                        },
                        datalabels: {
                            formatter: (value, ctx) => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return percentage > 5 ? `${percentage}%` : '';
                            },
                            color: '#fff',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            });
        }

        // Função para criar o gráfico de devoluções por loja
        function createReturnsByStoreChart() {
            const ctx = document.getElementById('returnsByStoreChart').getContext('2d');
            
            // Agrupar dados por loja
            const storeData = {};
            data.cnpjs.forEach(cnpj => {
                cnpj.stores.forEach(store => {
                    if (!storeData[store.name]) {
                        storeData[store.name] = { returns: 0, revenue: 0 };
                    }
                    storeData[store.name].returns += parseFloat(store.returns) || 0;
                    storeData[store.name].revenue += parseFloat(store.revenue) || 0;
                });
            });
            
            const storeNames = Object.keys(storeData);
            const returnsData = storeNames.map(name => storeData[name].returns);
            const returnsPercentage = storeNames.map(name => {
                const revenue = storeData[name].revenue;
                const returns = storeData[name].returns;
                return revenue > 0 ? (returns / revenue) * 100 : 0;
            });
            
            if (returnsByStoreChart) {
                returnsByStoreChart.destroy();
            }
            
            returnsByStoreChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: storeNames,
                    datasets: [
                        {
                            data: returnsData,
                            backgroundColor: storeNames.map((_, i) => chartColors[i % chartColors.length]),
                            borderColor: storeNames.map((_, i) => chartColors[i % chartColors.length].replace('0.7', '1')),
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const index = context.dataIndex;
                                    const percentage = returnsPercentage[index].toFixed(1);
                                    return `${context.label}: ${formatCurrency(value)} (${percentage}% do faturamento)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Função para criar um novo CNPJ
        function createNewCnpj() {
            const cnpjIndex = data.cnpjs.length;
            const newCnpj = {
                id: "",
                name: "",
                stores: []
            };
            
            // Adicionar lojas ao novo CNPJ
            data.stores.forEach(storeName => {
                newCnpj.stores.push({
                    name: storeName,
                    revenue: 0,
                    returns: 0,
                    orders: 0
                });
            });
            
            data.cnpjs.push(newCnpj);
            
            return { cnpj: newCnpj, index: cnpjIndex };
        }

        // Função para criar um elemento HTML para um CNPJ
        function createCnpjElement(cnpj, cnpjIndex) {
            const cnpjDiv = document.createElement('div');
            cnpjDiv.className = 'border border-gray-200 rounded-lg p-4';
            cnpjDiv.dataset.cnpjIndex = cnpjIndex;
            
            // Cabeçalho do CNPJ com botão de remover
            const headerDiv = document.createElement('div');
            headerDiv.className = 'flex items-center justify-between mb-4';
            headerDiv.innerHTML = `
                <h3 class="text-lg font-medium text-gray-700">CNPJ ${cnpjIndex + 1}</h3>
                <button class="remove-cnpj-btn text-red-500 hover:text-red-700" data-cnpj-index="${cnpjIndex}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            
            // Campos de entrada para ID e nome do CNPJ
            const infoDiv = document.createElement('div');
            infoDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4';
            infoDiv.innerHTML = `
                <div class="input-container border border-gray-300 rounded-md overflow-hidden">
                    <div class="bg-gray-50 px-4 py-2 text-sm text-gray-500">Número do CNPJ</div>
                    <input type="text" class="w-full px-4 py-2 cnpj-id" placeholder="00.000.000/0001-00" value="${cnpj.id}" data-cnpj-index="${cnpjIndex}">
                </div>
                
                <div class="input-container border border-gray-300 rounded-md overflow-hidden">
                    <div class="bg-gray-50 px-4 py-2 text-sm text-gray-500">Nome da Empresa</div>
                    <input type="text" class="w-full px-4 py-2 cnpj-name" placeholder="Nome da Empresa" value="${cnpj.name}" data-cnpj-index="${cnpjIndex}">
                </div>
            `;
            
            // Container para as lojas
            const storesDiv = document.createElement('div');
            storesDiv.className = 'space-y-4';
            
            // Adicionar cada loja
            cnpj.stores.forEach((store, storeIndex) => {
                const storeDiv = document.createElement('div');
                storeDiv.className = 'border border-gray-200 rounded-lg p-3';
                storeDiv.dataset.storeIndex = storeIndex;
                
                // Cabeçalho da loja com botão de remover
                const storeHeader = document.createElement('div');
                storeHeader.className = 'flex items-center justify-between mb-3';
                storeHeader.innerHTML = `
                    <h4 class="text-md font-medium text-gray-700">${store.name}</h4>
                    <button class="remove-store-btn text-red-500 hover:text-red-700" data-cnpj-index="${cnpjIndex}" data-store-index="${storeIndex}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                `;
                
                // Campos de entrada para os valores da loja
                const storeInputs = document.createElement('div');
                storeInputs.className = 'grid grid-cols-1 md:grid-cols-3 gap-3';
                storeInputs.innerHTML = `
                    <div class="input-container border border-gray-300 rounded-md overflow-hidden">
                        <div class="bg-gray-50 px-3 py-1 text-sm text-gray-500">Faturamento (R$)</div>
                        <input type="number" step="0.01" class="w-full px-3 py-1 store-revenue" placeholder="0.00" value="${store.revenue}" data-cnpj-index="${cnpjIndex}" data-store-index="${storeIndex}">
                    </div>
                    <div class="input-container border border-gray-300 rounded-md overflow-hidden">
                        <div class="bg-gray-50 px-3 py-1 text-sm text-gray-500">Devoluções (R$)</div>
                        <input type="number" step="0.01" class="w-full px-3 py-1 store-returns" placeholder="0.00" value="${store.returns}" data-cnpj-index="${cnpjIndex}" data-store-index="${storeIndex}">
                    </div>
                    <div class="input-container border border-gray-300 rounded-md overflow-hidden">
                        <div class="bg-gray-50 px-3 py-1 text-sm text-gray-500">Pedidos</div>
                        <input type="number" class="w-full px-3 py-1 store-orders" placeholder="0" value="${store.orders}" data-cnpj-index="${cnpjIndex}" data-store-index="${storeIndex}">
                    </div>
                `;
                
                storeDiv.appendChild(storeHeader);
                storeDiv.appendChild(storeInputs);
                storesDiv.appendChild(storeDiv);
            });
            
            // Botão para adicionar nova loja
            const addStoreButton = document.createElement('button');
            addStoreButton.className = 'mt-4 text-sm text-blue-500 hover:text-blue-700 flex items-center';
            addStoreButton.dataset.cnpjIndex = cnpjIndex;
            addStoreButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Adicionar Nova Loja
            `;
            addStoreButton.addEventListener('click', function() {
                addStoreToExistingCnpj(cnpjIndex);
            });
            
            cnpjDiv.appendChild(headerDiv);
            cnpjDiv.appendChild(infoDiv);
            cnpjDiv.appendChild(storesDiv);
            cnpjDiv.appendChild(addStoreButton);
            
            return cnpjDiv;
        }

        // Função para adicionar uma nova loja a um CNPJ existente
        function addStoreToExistingCnpj(cnpjIndex) {
            // Abrir modal para selecionar a loja
            const storeName = prompt("Digite o nome da nova loja:");
            
            if (storeName && storeName.trim() !== "") {
                // Verificar se a loja já existe neste CNPJ
                const storeExists = data.cnpjs[cnpjIndex].stores.some(store => store.name.toLowerCase() === storeName.trim().toLowerCase());
                
                if (storeExists) {
                    alert("Esta loja já existe para este CNPJ.");
                    return;
                }
                
                // Adicionar nova loja aos dados
                const newStore = {
                    name: storeName.trim(),
                    revenue: 0,
                    returns: 0,
                    orders: 0
                };
                
                data.cnpjs[cnpjIndex].stores.push(newStore);
                
                // Adicionar a loja à lista global se não existir
                if (!data.stores.includes(storeName.trim())) {
                    data.stores.push(storeName.trim());
                }
                
                // Atualizar a interface
                renderCnpjConfig();
                updateReport();
            }
        }

        // Função para adicionar um novo CNPJ
        function addNewCnpj() {
            const { cnpj, index } = createNewCnpj();
            renderCnpjConfig();
            updateReport();
        }

        // Função para remover um CNPJ
        function removeCnpj(cnpjIndex) {
            if (confirm("Tem certeza que deseja remover este CNPJ?")) {
                data.cnpjs.splice(cnpjIndex, 1);
                renderCnpjConfig();
                updateReport();
            }
        }

        // Função para remover uma loja de um CNPJ
        function removeStore(cnpjIndex, storeIndex) {
            if (confirm("Tem certeza que deseja remover esta loja?")) {
                data.cnpjs[cnpjIndex].stores.splice(storeIndex, 1);
                renderCnpjConfig();
                updateReport();
            }
        }

        // Função para renderizar a configuração de CNPJs
        function renderCnpjConfig() {
            const cnpjConfig = document.getElementById('cnpjConfig');
            cnpjConfig.innerHTML = '';
            
            data.cnpjs.forEach((cnpj, index) => {
                const cnpjElement = createCnpjElement(cnpj, index);
                cnpjConfig.appendChild(cnpjElement);
            });
            
            // Adicionar event listeners para os botões de remover
            document.querySelectorAll('.remove-cnpj-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    removeCnpj(cnpjIndex);
                });
            });
            
            document.querySelectorAll('.remove-store-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    const storeIndex = parseInt(this.dataset.storeIndex);
                    removeStore(cnpjIndex, storeIndex);
                });
            });
            
            // Adicionar event listeners para os campos de entrada
            document.querySelectorAll('.cnpj-id').forEach(input => {
                input.addEventListener('change', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    data.cnpjs[cnpjIndex].id = this.value;
                    updateReport();
                });
            });
            
            document.querySelectorAll('.cnpj-name').forEach(input => {
                input.addEventListener('change', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    data.cnpjs[cnpjIndex].name = this.value;
                    updateReport();
                });
            });
            
            document.querySelectorAll('.store-revenue').forEach(input => {
                input.addEventListener('change', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    const storeIndex = parseInt(this.dataset.storeIndex);
                    data.cnpjs[cnpjIndex].stores[storeIndex].revenue = this.value;
                    updateReport();
                });
            });
            
            document.querySelectorAll('.store-returns').forEach(input => {
                input.addEventListener('change', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    const storeIndex = parseInt(this.dataset.storeIndex);
                    data.cnpjs[cnpjIndex].stores[storeIndex].returns = this.value;
                    updateReport();
                });
            });
            
            document.querySelectorAll('.store-orders').forEach(input => {
                input.addEventListener('change', function() {
                    const cnpjIndex = parseInt(this.dataset.cnpjIndex);
                    const storeIndex = parseInt(this.dataset.storeIndex);
                    data.cnpjs[cnpjIndex].stores[storeIndex].orders = this.value;
                    updateReport();
                });
            });
        }

        // Função para adicionar uma nova loja global
        function addNewStore() {
            const storeName = prompt("Digite o nome da nova loja:");
            
            if (storeName && storeName.trim() !== "") {
                // Verificar se a loja já existe
                if (data.stores.includes(storeName.trim())) {
                    alert("Esta loja já existe.");
                    return;
                }
                
                // Adicionar a loja à lista global
                data.stores.push(storeName.trim());
                
                // Adicionar a loja a todos os CNPJs
                data.cnpjs.forEach(cnpj => {
                    cnpj.stores.push({
                        name: storeName.trim(),
                        revenue: 0,
                        returns: 0,
                        orders: 0
                    });
                });
                
                // Atualizar a interface
                renderCnpjConfig();
                updateReport();
            }
        }

        // Função para salvar os dados no localStorage
        function saveData() {
            // Salvar no localStorage
            localStorage.setItem('reportData', JSON.stringify(data));
            localStorage.setItem('lastMonth', document.getElementById('monthSelector').value);
            
            // Mostrar mensagem de sucesso
            alert('Dados salvos com sucesso!');
        }

        // Função para carregar dados do localStorage
        function loadData() {
            const savedData = localStorage.getItem('reportData');
            const savedMonth = localStorage.getItem('lastMonth');
            
            if (savedData) {
                data = JSON.parse(savedData);
            } else {
                // Criar dados iniciais se não houver dados salvos
                addNewCnpj();
            }
            
            if (savedMonth) {
                document.getElementById('monthSelector').value = savedMonth;
            }
        }

        // Função para atualizar todo o relatório
        function updateReport() {
            updateCurrentDate();
            calculateTotals();
            populateCnpjTable();
            populateStoreTable();
            createRevenueByCnpjChart();
            createRevenueByStoreChart();
            createOrdersByStoreChart();
            createReturnsByStoreChart();
        }

        // Inicializar o relatório
        function initReport() {
            // Carregar dados salvos
            loadData();
            
            // Renderizar a configuração de CNPJs
            renderCnpjConfig();
            
            // Atualizar o relatório
            updateReport();
            
            // Adicionar event listeners
            document.getElementById('monthSelector').addEventListener('change', updateCurrentDate);
            document.getElementById('saveDataBtn').addEventListener('click', saveData);
            document.getElementById('addCnpjBtn').addEventListener('click', addNewCnpj);
            document.getElementById('addStoreBtn').addEventListener('click', addNewStore);
        }

        // Inicializar o relatório quando a página carregar
        document.addEventListener('DOMContentLoaded', initReport);