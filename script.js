// 共通データモデル - PC/モバイル共通で使用
const budgetData = {
    carryover: ['0'], // 1月の繰越のみ設定（他は自動計算）
    income: ['100,000', '30,000', '50,000', '40,000', '20,000', '35,000', '400,000', '25,000', '15,000', '25,000', '20,000', '15,000', '400,000', '30,000'],
    expenses: [
        {
            purposes: ['食費', '日用品', '交通費', '医療費', '娯楽', '雑費', '旅行', '食費', '日用品', '交通費', '光熱費', '雑費', 'ギフト', '食費'],
            amounts: ['-20,000', '-15,000', '-18,000', '-12,000', '-8,000', '-15,000', '-250,000', '-20,000', '-12,000', '-18,000', '-15,000', '-10,000', '-80,000', '-22,000']
        },
        {
            purposes: ['衣服', '書籍', '外食', '歯医者', 'ジム', '交際費', '特別支出', '衣服', '雑費', '書籍', '保険', 'その他', '年末支出', 'その他'],
            amounts: ['-15,000', '-10,000', '-12,000', '-8,000', '-5,000', '-10,000', '-100,000', '-15,000', '-8,000', '-12,000', '-8,000', '-5,000', '-120,000', '-18,000']
        }
    ],
    bonusMonths: [6, 12] // ボーナス月のインデックス（0ベース）
};

// 繰越金額を自動計算する関数
function calculateCarryovers() {
    // 配列を14個に拡張
    while (budgetData.carryover.length < 14) {
        budgetData.carryover.push('0');
    }
    
    // 2月以降の繰越を前月の残高から自動計算
    for (let i = 1; i < 14; i++) {
        // 前月の残高を計算
        const prevCarry = parseInt(budgetData.carryover[i-1].replace(/,/g, '')) || 0;
        const prevIncome = parseInt(budgetData.income[i-1].replace(/,/g, '')) || 0;
        const prevTotal = prevCarry + prevIncome;
        
        let prevExpenseTotal = 0;
        budgetData.expenses.forEach(expense => {
            const amount = parseInt(expense.amounts[i-1]?.replace(/[^-0-9]/g, '')) || 0;
            prevExpenseTotal += amount;
        });
        
        const prevBalance = prevTotal + prevExpenseTotal;
        
        // 今月の繰越として設定
        budgetData.carryover[i] = formatAmount(prevBalance);
    }
}

// デスクトップ版データ生成
function generateDesktopData() {
    // 繰越を自動計算
    calculateCarryovers();
    
    const body = document.getElementById('tableBody');
    if (!body) return;

    let html = '';

    // 繰越（自動計算済み）
    html += '<div class="row-label carryover">繰越</div>';
    budgetData.carryover.forEach((val, i) => {
        const isBonus = budgetData.bonusMonths.includes(i);
        // 1月のみ編集可能、他は自動計算なので編集不可
        if (i === 0) {
            html += `<div class="amount-cell carryover ${isBonus ? 'bonus-col' : ''}" onclick="editAmount(this, 'carryover', ${i})">${val}</div>`;
        } else {
            html += `<div class="amount-cell carryover ${isBonus ? 'bonus-col' : ''}" style="cursor: default; opacity: 0.8;">${val}</div>`;
        }
    });

    // 今月+
    html += '<div class="row-label income">今月+</div>';
    budgetData.income.forEach((val, i) => {
        const isBonus = budgetData.bonusMonths.includes(i);
        html += `<div class="amount-cell income ${isBonus ? 'bonus-col' : ''}" onclick="editAmount(this, 'income', ${i})">${val}</div>`;
    });

    // 月初合計
    html += '<div class="row-label total">月初合計</div>';
    budgetData.carryover.forEach((carryVal, i) => {
        const carry = parseInt(carryVal.replace(/,/g, '')) || 0;
        const income = parseInt(budgetData.income[i].replace(/,/g, '')) || 0;
        const total = carry + income;
        const isBonus = budgetData.bonusMonths.includes(i);
        html += `<div class="amount-cell total ${isBonus ? 'bonus-col' : ''}">${formatAmount(total)}</div>`;
    });

    // 支出ヘッダー
    html += '<div class="row-label expense">支出項目</div>';
    for (let i = 0; i < 14; i++) {
        const isBonus = budgetData.bonusMonths.includes(i);
        html += `<div class="expense-header ${isBonus ? 'bonus-col' : ''}">
            <div class="expense-header-cell">用途</div>
            <div class="expense-header-cell">金額</div>
            <div class="expense-header-cell">残高</div>
        </div>`;
    }

    // 支出行 - データから動的に生成
    budgetData.expenses.forEach((expense, expIndex) => {
        html += `<div class="row-label expense">今月-${expIndex + 1}</div>`;
        
        expense.purposes.forEach((purpose, monthIdx) => {
            const isBonus = budgetData.bonusMonths.includes(monthIdx);
            const amount = parseInt(expense.amounts[monthIdx].replace(/[^-0-9]/g, '')) || 0;
            
            // 残高計算
            const carry = parseInt(budgetData.carryover[monthIdx].replace(/,/g, '')) || 0;
            const income = parseInt(budgetData.income[monthIdx].replace(/,/g, '')) || 0;
            const monthTotal = carry + income;
            
            let totalExpense = 0;
            for (let i = 0; i <= expIndex; i++) {
                if (i < expIndex) {
                    totalExpense += parseInt(budgetData.expenses[i].amounts[monthIdx].replace(/[^-0-9]/g, '')) || 0;
                } else {
                    totalExpense += amount;
                }
            }
            const balance = monthTotal + totalExpense;
            
            html += `<div class="amount-cell-group ${isBonus ? 'bonus-col' : ''}">
                <div class="expense-purpose" onclick="editPurpose(this, ${expIndex}, ${monthIdx})">${purpose}</div>
                <div class="expense-amount" onclick="editAmount(this, 'expense', ${monthIdx}, ${expIndex})">${expense.amounts[monthIdx]}</div>
                <div class="expense-balance">${formatAmount(balance)}</div>
            </div>`;
        });
    });

    // 支出合計
    html += '<div class="row-label expense-total">支出合計</div>';
    for (let i = 0; i < 14; i++) {
        const isBonus = budgetData.bonusMonths.includes(i);
        let total = 0;
        budgetData.expenses.forEach(expense => {
            const amount = parseInt(expense.amounts[i]?.replace(/[^-0-9]/g, '')) || 0;
            total += amount;
        });
        html += `<div class="amount-cell expense-total ${isBonus ? 'bonus-col' : ''}">${formatAmount(total)}</div>`;
    }

    // 残高
    html += '<div class="row-label balance">残高</div>';
    for (let i = 0; i < 14; i++) {
        const isBonus = budgetData.bonusMonths.includes(i);
        const carry = parseInt(budgetData.carryover[i].replace(/,/g, '')) || 0;
        const income = parseInt(budgetData.income[i].replace(/,/g, '')) || 0;
        const monthTotal = carry + income;
        
        let totalExpense = 0;
        budgetData.expenses.forEach(expense => {
            const amount = parseInt(expense.amounts[i]?.replace(/[^-0-9]/g, '')) || 0;
            totalExpense += amount;
        });
        
        const balance = monthTotal + totalExpense;
        html += `<div class="amount-cell balance ${isBonus ? 'bonus-col' : ''}">${formatAmount(balance)}</div>`;
    }

    body.innerHTML = html;
    
    // 削除リスナーを追加
    addDeleteListeners();
}

// モバイル版データ生成
function generateMobileData() {
    // 繰越を自動計算
    calculateCarryovers();
    
    const mobileGroups = [
        { start: 0, end: 3, bodyId: 'mobileTableBody1' },
        { start: 3, end: 6, bodyId: 'mobileTableBody2' },
        { start: 6, end: 9, bodyId: 'mobileTableBody3' },
        { start: 9, end: 12, bodyId: 'mobileTableBody4' },
        { start: 12, end: 14, bodyId: 'mobileTableBody5' }
    ];

    mobileGroups.forEach(group => {
        const body = document.getElementById(group.bodyId);
        if (!body) return;

        let html = '';
        const monthCount = group.end - group.start;

        // 繰越（自動計算済み）
        html += '<div class="mobile-row-label carryover">繰越</div>';
        for (let i = group.start; i < group.end; i++) {
            if (i < budgetData.carryover.length) {
                const isBonus = budgetData.bonusMonths.includes(i);
                // 1月のみ編集可能
                if (i === 0) {
                    html += `<div class="mobile-amount-cell carryover ${isBonus ? 'bonus-col' : ''}" onclick="editMobileAmount(this, 'carryover', ${i})">${budgetData.carryover[i]}</div>`;
                } else {
                    html += `<div class="mobile-amount-cell carryover ${isBonus ? 'bonus-col' : ''}" style="cursor: default; opacity: 0.8;">${budgetData.carryover[i]}</div>`;
                }
            } else {
                html += `<div class="mobile-amount-cell carryover" style="opacity: 0.3;">-</div>`;
            }
        }
        if (monthCount < 3) {
            for (let j = 0; j < 3 - monthCount; j++) {
                html += `<div class="mobile-amount-cell carryover" style="opacity: 0.3;">-</div>`;
            }
        }

        // 今月+
        html += '<div class="mobile-row-label income">今月+</div>';
        for (let i = group.start; i < group.end; i++) {
            if (i < budgetData.income.length) {
                const isBonus = budgetData.bonusMonths.includes(i);
                html += `<div class="mobile-amount-cell income ${isBonus ? 'bonus-col' : ''}" onclick="editMobileAmount(this, 'income', ${i})">${budgetData.income[i]}</div>`;
            } else {
                html += `<div class="mobile-amount-cell income" style="opacity: 0.3;">-</div>`;
            }
        }
        if (monthCount < 3) {
            for (let j = 0; j < 3 - monthCount; j++) {
                html += `<div class="mobile-amount-cell income" style="opacity: 0.3;">-</div>`;
            }
        }

        // 月初合計
        html += '<div class="mobile-row-label total">月初合計</div>';
        for (let i = group.start; i < group.end; i++) {
            if (i < budgetData.carryover.length) {
                const carry = parseInt(budgetData.carryover[i].replace(/,/g, '')) || 0;
                const income = parseInt(budgetData.income[i].replace(/,/g, '')) || 0;
                const total = carry + income;
                const isBonus = budgetData.bonusMonths.includes(i);
                html += `<div class="mobile-amount-cell total ${isBonus ? 'bonus-col' : ''}">${formatAmount(total)}</div>`;
            } else {
                html += `<div class="mobile-amount-cell total" style="opacity: 0.3;">-</div>`;
            }
        }
        if (monthCount < 3) {
            for (let j = 0; j < 3 - monthCount; j++) {
                html += `<div class="mobile-amount-cell total" style="opacity: 0.3;">-</div>`;
            }
        }

        // 支出ヘッダー
        html += '<div class="mobile-row-label expense">支出項目</div>';
        for (let i = group.start; i < Math.min(group.end, group.start + 3); i++) {
            if (i < 14) {
                const isBonus = budgetData.bonusMonths.includes(i);
                html += `<div class="mobile-expense-header ${isBonus ? 'bonus-col' : ''}">
                    <div class="mobile-expense-header-cell">用途</div>
                    <div class="mobile-expense-header-cell">金額</div>
                    <div class="mobile-expense-header-cell">残高</div>
                </div>`;
            } else {
                html += `<div class="mobile-expense-header" style="opacity: 0.3;">
                    <div class="mobile-expense-header-cell">-</div>
                    <div class="mobile-expense-header-cell">-</div>
                    <div class="mobile-expense-header-cell">-</div>
                </div>`;
            }
        }

        // 支出行
        budgetData.expenses.forEach((expense, expIndex) => {
            html += `<div class="mobile-row-label expense">今月-${expIndex + 1}</div>`;
            
            for (let i = group.start; i < Math.min(group.end, group.start + 3); i++) {
                if (i < expense.purposes.length) {
                    const isBonus = budgetData.bonusMonths.includes(i);
                    const amount = parseInt(expense.amounts[i].replace(/[^-0-9]/g, '')) || 0;
                    
                    // 残高計算
                    const carry = parseInt(budgetData.carryover[i].replace(/,/g, '')) || 0;
                    const income = parseInt(budgetData.income[i].replace(/,/g, '')) || 0;
                    const monthTotal = carry + income;
                    
                    let totalExpense = 0;
                    for (let j = 0; j <= expIndex; j++) {
                        if (j < expIndex) {
                            totalExpense += parseInt(budgetData.expenses[j].amounts[i].replace(/[^-0-9]/g, '')) || 0;
                        } else {
                            totalExpense += amount;
                        }
                    }
                    const balance = monthTotal + totalExpense;
                    
                    html += `<div class="mobile-amount-cell-group ${isBonus ? 'bonus-col' : ''}">
                        <div class="mobile-expense-purpose" onclick="editMobilePurpose(this, ${expIndex}, ${i})">${expense.purposes[i]}</div>
                        <div class="mobile-expense-amount" onclick="editMobileAmount(this, 'expense', ${i}, ${expIndex})">${expense.amounts[i]}</div>
                        <div class="mobile-expense-balance">${formatAmount(balance)}</div>
                    </div>`;
                } else {
                    html += `<div class="mobile-amount-cell-group" style="opacity: 0.3;">
                        <div class="mobile-expense-purpose">-</div>
                        <div class="mobile-expense-amount">-</div>
                        <div class="mobile-expense-balance">-</div>
                    </div>`;
                }
            }
        });

        // 支出合計
        html += '<div class="mobile-row-label expense-total">支出合計</div>';
        for (let i = group.start; i < Math.min(group.end, group.start + 3); i++) {
            if (i < 14) {
                const isBonus = budgetData.bonusMonths.includes(i);
                let total = 0;
                budgetData.expenses.forEach(expense => {
                    const amount = parseInt(expense.amounts[i]?.replace(/[^-0-9]/g, '')) || 0;
                    total += amount;
                });
                html += `<div class="mobile-amount-cell expense-total ${isBonus ? 'bonus-col' : ''}">${formatAmount(total)}</div>`;
            } else {
                html += `<div class="mobile-amount-cell expense-total" style="opacity: 0.3;">-</div>`;
            }
        }

        // 残高
        html += '<div class="mobile-row-label balance">残高</div>';
        for (let i = group.start; i < Math.min(group.end, group.start + 3); i++) {
            if (i < 14) {
                const isBonus = budgetData.bonusMonths.includes(i);
                const carry = parseInt(budgetData.carryover[i].replace(/,/g, '')) || 0;
                const income = parseInt(budgetData.income[i].replace(/,/g, '')) || 0;
                const monthTotal = carry + income;
                
                let totalExpense = 0;
                budgetData.expenses.forEach(expense => {
                    const amount = parseInt(expense.amounts[i]?.replace(/[^-0-9]/g, '')) || 0;
                    totalExpense += amount;
                });
                
                const balance = monthTotal + totalExpense;
                html += `<div class="mobile-amount-cell balance ${isBonus ? 'bonus-col' : ''}">${formatAmount(balance)}</div>`;
            } else {
                html += `<div class="mobile-amount-cell balance" style="opacity: 0.3;">-</div>`;
            }
        }

        body.innerHTML = html;
    });
    
    // 削除リスナーを追加
    addDeleteListeners();
}

// 編集機能（データモデル更新版）
function editAmount(cell, type, monthIndex, expenseIndex) {
    // 繰越の編集は1月のみ許可
    if (type === 'carryover' && monthIndex !== 0) {
        return;
    }
    
    const currentValue = cell.textContent.replace(/[^-0-9]/g, '');
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentValue;
    input.style.width = '100%';
    input.style.fontSize = '10px';
    input.style.padding = '2px';
    input.style.border = '1px solid #3498db';
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    function saveValue() {
        const value = parseInt(input.value) || 0;
        const formattedValue = formatAmount(value);
        
        // データモデルを更新
        if (type === 'carryover') {
            budgetData.carryover[monthIndex] = formattedValue;
        } else if (type === 'income') {
            budgetData.income[monthIndex] = formattedValue;
        } else if (type === 'expense' && expenseIndex !== undefined) {
            budgetData.expenses[expenseIndex].amounts[monthIndex] = formattedValue;
        }
        
        // 両方のビューを再生成
        generateDesktopData();
        generateMobileData();
    }
    
    input.addEventListener('blur', saveValue);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveValue();
    });
}

function editPurpose(cell, expenseIndex, monthIndex) {
    const currentValue = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.style.width = '100%';
    input.style.fontSize = '8px';
    input.style.padding = '2px';
    input.style.border = '1px solid #3498db';
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    function saveValue() {
        const value = input.value.trim() || '-';
        
        // データモデルを更新
        budgetData.expenses[expenseIndex].purposes[monthIndex] = value;
        
        // 両方のビューを再生成
        generateDesktopData();
        generateMobileData();
    }
    
    input.addEventListener('blur', saveValue);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveValue();
    });
}

function editMobileAmount(cell, type, monthIndex, expenseIndex) {
    // 繰越の編集は1月のみ許可
    if (type === 'carryover' && monthIndex !== 0) {
        return;
    }
    editAmount(cell, type, monthIndex, expenseIndex);
}

function editMobilePurpose(cell, expenseIndex, monthIndex) {
    editPurpose(cell, expenseIndex, monthIndex);
}

function formatAmount(amount) {
    if (amount === 0) return '0';
    const prefix = amount < 0 ? '-' : '';
    return prefix + Math.abs(amount).toLocaleString();
}

// スワイプ機能
let currentGroup = 0;
const totalGroups = 5;
const groupNames = [
    'グループ 1 (1-3月)',
    'グループ 2 (4-6月)', 
    'グループ 3 (夏ボ-8月)',
    'グループ 4 (9-11月)',
    'グループ 5 (冬ボ-12月)'
];

function moveToGroup(groupIndex) {
    if (groupIndex < 0 || groupIndex >= totalGroups) return;
    
    currentGroup = groupIndex;
    const wrapper = document.getElementById('swipeWrapper');
    wrapper.style.transform = `translateX(-${groupIndex * 100}%)`;
    
    updateNavigation();
}

function updateNavigation() {
    document.getElementById('groupTitle').textContent = groupNames[currentGroup];
    
    const dots = document.querySelectorAll('.group-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentGroup);
    });
    
    document.getElementById('prevGroup').disabled = currentGroup === 0;
    document.getElementById('nextGroup').disabled = currentGroup === totalGroups - 1;
    
    if (currentGroup > 0) {
        const hint = document.getElementById('swipeHint');
        if (hint) hint.style.display = 'none';
    }
}

// スワイプイベント
// let startX = 0;
// let currentX = 0;
// let isDragging = false;

// const container = document.getElementById('swipeContainer');

// container.addEventListener('touchstart', function(e) {
//     startX = e.touches[0].clientX;
//     isDragging = true;
// });

// container.addEventListener('touchmove', function(e) {
//     if (!isDragging) return;
//     e.preventDefault();
//     currentX = e.touches[0].clientX;
// });

// container.addEventListener('touchend', function(e) {
//     if (!isDragging) return;
//     isDragging = false;
    
//     const deltaX = startX - currentX;
//     const threshold = 50;
    
//     if (deltaX > threshold && currentGroup < totalGroups - 1) {
//         moveToGroup(currentGroup + 1);
//     } else if (deltaX < -threshold && currentGroup > 0) {
//         moveToGroup(currentGroup - 1);
//     }
// });

// ナビゲーションボタン
const prevBtn = document.getElementById('prevGroup');
const nextBtn = document.getElementById('nextGroup');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentGroup > 0) moveToGroup(currentGroup - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentGroup < totalGroups - 1) moveToGroup(currentGroup + 1);
    });
}

// キーボードイベント
document.addEventListener('keydown', function(e) {
    if (window.innerWidth <= 768) {
        if (e.key === 'ArrowLeft' && currentGroup > 0) {
            moveToGroup(currentGroup - 1);
        } else if (e.key === 'ArrowRight' && currentGroup < totalGroups - 1) {
            moveToGroup(currentGroup + 1);
        }
    }
});

// 初期化
window.addEventListener('DOMContentLoaded', function() {
    generateDesktopData();
    generateMobileData();
    moveToGroup(0);
});

// タブ切り替え機能
function switchTab(tabName) {
    // タブボタンの切り替え
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'expense') {
        document.getElementById('expenseTab').classList.add('active');
        document.getElementById('expenseContent').classList.add('active');
    } else {
        document.getElementById('incomeTab').classList.add('active');
        document.getElementById('incomeContent').classList.add('active');
    }
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// 追加ボタン機能
const addBtnMain = document.getElementById('addExpenseBtn');
const modalOverlay = document.getElementById('modalOverlay');
const expenseDate = document.getElementById('expenseDate');
const expensePurpose = document.getElementById('expensePurpose');
const expenseAmount = document.getElementById('expenseAmount');
const incomeDate = document.getElementById('incomeDate');
const incomeSource = document.getElementById('incomeSource');
const incomeAmount = document.getElementById('incomeAmount');

// 今日の日付をデフォルトで設定
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    expenseDate.value = dateString;
    incomeDate.value = dateString;
}

// メインの追加ボタンクリック
addBtnMain.addEventListener('click', function() {
    setDefaultDate();
    // フォームをクリア
    expensePurpose.value = '';
    expenseAmount.value = '';
    incomeSource.value = '';
    incomeAmount.value = '';
    switchTab('expense'); // デフォルトで支出タブを表示
    modalOverlay.classList.add('active');
});

// モーダル外クリックで閉じる
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// 支出追加ボタンのイベントリスナー
document.getElementById('addExpenseBtnModal').addEventListener('click', function() {
    const date = new Date(expenseDate.value);
    const purpose = expensePurpose.value.trim();
    const amount = parseInt(expenseAmount.value);

    if (!expenseDate.value || !purpose || !amount) {
        alert('すべての項目を入力してください');
        return;
    }

    // 月を特定（0-11のインデックス）
    const monthIndex = date.getMonth();
    
    // 年のチェック
    if (date.getFullYear() !== 2025 || monthIndex > 11) {
        alert('2025年1月〜12月の日付を選択してください');
        return;
    }

    // 既存の行で空きスロットを探す
    let targetExpenseRow = null;
    let emptySlotFound = false;

    for (let i = 0; i < budgetData.expenses.length; i++) {
        if (budgetData.expenses[i].purposes[monthIndex] === '-' || 
            budgetData.expenses[i].purposes[monthIndex] === '') {
            targetExpenseRow = i;
            emptySlotFound = true;
            break;
        }
    }

    // 空きスロットがない場合、新しい行を作成
    if (!emptySlotFound) {
        const newRow = {
            purposes: Array(14).fill('-'),
            amounts: Array(14).fill('0')
        };
        budgetData.expenses.push(newRow);
        targetExpenseRow = budgetData.expenses.length - 1;
    }

    // データを設定
    budgetData.expenses[targetExpenseRow].purposes[monthIndex] = purpose;
    budgetData.expenses[targetExpenseRow].amounts[monthIndex] = formatAmount(-Math.abs(amount));

    // ビューを再生成
    generateDesktopData();
    generateMobileData();

    // モーダルを閉じる
    closeModal();

    // 成功メッセージ
    showSuccessMessage('expense', monthIndex, purpose, amount);
});

// 収入追加ボタンのイベントリスナー
document.getElementById('addIncomeBtnModal').addEventListener('click', function() {
    const date = new Date(incomeDate.value);
    const source = incomeSource.value.trim();
    const amount = parseInt(incomeAmount.value);

    if (!incomeDate.value || !source || !amount) {
        alert('すべての項目を入力してください');
        return;
    }

    // 月を特定
    const monthIndex = date.getMonth();
    
    // 年のチェック
    if (date.getFullYear() !== 2025 || monthIndex > 11) {
        alert('2025年1月〜12月の日付を選択してください');
        return;
    }

    // 既存の収入に加算
    const currentIncome = parseInt(budgetData.income[monthIndex].replace(/,/g, '')) || 0;
    const newIncome = currentIncome + amount;
    budgetData.income[monthIndex] = formatAmount(newIncome);

    // ビューを再生成
    generateDesktopData();
    generateMobileData();

    // モーダルを閉じる
    closeModal();

    // 成功メッセージ
    showSuccessMessage('income', monthIndex, source, amount);
});

// 成功メッセージを表示
function showSuccessMessage(type, monthIndex, description, amount) {
    // メインの+ボタンに成功マークを表示
    const mainBtn = document.getElementById('addExpenseBtn');
    const originalHTML = mainBtn.innerHTML;
    mainBtn.innerHTML = '✓';
    
    if (type === 'expense') {
        mainBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        mainBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)';
    }
    
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // トースト通知を作成
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'expense' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(0, 184, 148, 0.9)'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideUpFade 0.3s ease;
    `;
    
    // メッセージ内容を設定
    if (type === 'expense') {
        message.innerHTML = `🔥 ${monthNames[monthIndex]}に支出「${description}」<span style="font-size: 16px; font-weight: bold;">¥${amount.toLocaleString()}</span>を追加しました！`;
    } else {
        message.innerHTML = `💰 ${monthNames[monthIndex]}に収入「${description}」<span style="font-size: 16px; font-weight: bold;">¥${amount.toLocaleString()}</span>を追加しました！`;
    }
    
    document.body.appendChild(message);
    
    // アニメーション用のスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUpFade {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // 2.5秒後に消去
    setTimeout(() => {
        message.style.animation = 'slideDownFade 0.3s ease';
        message.style.opacity = '0';
        
        setTimeout(() => {
            mainBtn.innerHTML = originalHTML;
            mainBtn.style.background = '';
            message.remove();
            style.remove();
        }, 300);
    }, 2500);
}

// 支出行を削除する機能（個別のセルを長押しで削除）
function addDeleteListeners() {
    document.querySelectorAll('.expense-purpose, .mobile-expense-purpose').forEach(cell => {
        let deleteTimer;
        
        cell.addEventListener('mousedown', function(e) {
            const purpose = e.target.textContent;
            if (purpose && purpose !== '-') {
                deleteTimer = setTimeout(() => {
                    if (confirm(`「${purpose}」を削除しますか？`)) {
                        // データの位置を特定して削除
                        const cellElement = e.target;
                        // onclick属性から情報を取得するか、データ属性を使用
                        cellElement.textContent = '-';
                        // 対応する金額も0に
                        const amountCell = cellElement.nextElementSibling;
                        if (amountCell) {
                            amountCell.textContent = '0';
                        }
                        generateDesktopData();
                        generateMobileData();
                    }
                }, 1500); // 1.5秒長押し
            }
        });

        cell.addEventListener('mouseup', () => clearTimeout(deleteTimer));
        cell.addEventListener('mouseleave', () => clearTimeout(deleteTimer));
        
        // タッチデバイス対応
        cell.addEventListener('touchstart', function(e) {
            const purpose = e.target.textContent;
            if (purpose && purpose !== '-') {
                deleteTimer = setTimeout(() => {
                    if (confirm(`「${purpose}」を削除しますか？`)) {
                        e.target.textContent = '-';
                        const amountCell = e.target.nextElementSibling;
                        if (amountCell) {
                            amountCell.textContent = '0';
                        }
                        generateDesktopData();
                        generateMobileData();
                    }
                }, 1500);
            }
        });
        
        cell.addEventListener('touchend', () => clearTimeout(deleteTimer));
        cell.addEventListener('touchcancel', () => clearTimeout(deleteTimer));
    });
}


// test
// === データ永続化機能 ===

// 自動保存を有効化
function enableAutoSave() {
    // 既存の編集関数をラップ
    const originalGenerateDesktop = generateDesktopData;
    const originalGenerateMobile = generateMobileData;
    
    generateDesktopData = function() {
        originalGenerateDesktop();
        saveDataToStorage();
    };
    
    generateMobileData = function() {
        originalGenerateMobile();
        saveDataToStorage();
    };
}

// localStorage保存
function saveDataToStorage() {
    try {
        localStorage.setItem('budgetData_2025', JSON.stringify(budgetData));
        console.log('✅ データ自動保存完了');
    } catch (e) {
        console.error('保存エラー:', e);
    }
}

// localStorage読み込み
function loadDataFromStorage() {
    try {
        const saved = localStorage.getItem('budgetData_2025');
        if (saved) {
            const loadedData = JSON.parse(saved);
            Object.assign(budgetData, loadedData);
            console.log('✅ 保存データ読み込み完了');
            return true;
        }
    } catch (e) {
        console.error('読み込みエラー:', e);
    }
    return false;
}

// エクスポート機能
function exportData() {
    const dataStr = JSON.stringify(budgetData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// インポート機能
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                Object.assign(budgetData, imported);
                generateDesktopData();
                generateMobileData();
                saveDataToStorage();
                alert('✅ データをインポートしました');
            } catch (err) {
                alert('❌ インポート失敗: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// 初期化を修正
const originalInit = window.addEventListener;
window.addEventListener('DOMContentLoaded', function() {
    // 保存データを読み込み
    loadDataFromStorage();
    
    // 自動保存を有効化
    enableAutoSave();
    
    // 通常の初期化
    generateDesktopData();
    generateMobileData();
    moveToGroup(0);
    
    // デバッグ用コンソール
    console.log('💾 localStorage自動保存: 有効');
    console.log('📝 データエクスポート: exportData()');
    console.log('📂 データインポート: importData()');
});
