// 防抖函数，避免页面频繁变动时脚本疯狂运行
function debounce(func, wait) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
    };
}

// 主要处理逻辑
function processMessages() {
    // 获取所有的对话行 (ChatGPT通常用 <article> 标签包裹每一条消息)
    const articles = document.querySelectorAll('article');
    
    let turnCount = 0; // 对话轮次计数器

    articles.forEach((article) => {
        // 如果已经处理过，就跳过，防止重复添加标签
        if (article.dataset.beautified === "true") return;

        // 尝试判断身份
        // ChatGPT 的 DOM 中通常包含 data-message-author-role="user" 或 "assistant"
        const userMsg = article.querySelector('[data-message-author-role="user"]');
        const aiMsg = article.querySelector('[data-message-author-role="assistant"]');

        if (userMsg) {
            // --- 这是一个用户的提问 ---
            turnCount++; // 新的一轮开始
            
            // 标记样式
            article.classList.add('my-user-msg');
            
            // 添加计数标签
            addLabel(article, `第 ${turnCount} 轮对话`);
            
            // 标记已处理
            article.dataset.beautified = "true";

        } else if (aiMsg) {
            // --- 这是一个 AI 的回答 ---
            
            // 标记样式
            article.classList.add('my-ai-msg');
            
            // 标记已处理
            article.dataset.beautified = "true";
        }
    });

    // 重新计算一遍标签（为了防止历史记录加载时顺序错乱）
    // 如果想要更严谨的计数，可以在这里重新遍历所有已标记的元素修正数字
    recalculateLabels();
}

function addLabel(element, text) {
    // 创建一个小标签 div
    const label = document.createElement('div');
    label.className = 'turn-counter-label';
    label.innerText = text;
    element.prepend(label); // 插入到元素最前面
}

// 修正序号逻辑：确保序号是连续的（针对页面滚动加载的情况）
function recalculateLabels() {
    const userArticles = document.querySelectorAll('article.my-user-msg');
    userArticles.forEach((article, index) => {
        const label = article.querySelector('.turn-counter-label');
        if (label) {
            label.innerText = `第 ${index + 1} 轮对话`;
        }
    });
}

// 使用 MutationObserver 监听网页变化（因为ChatGPT是动态加载的）
const observer = new MutationObserver(debounce(processMessages, 200));

// 开始监听 body 的变化
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 初始运行一次
processMessages();