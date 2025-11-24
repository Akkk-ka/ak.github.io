// HTML冒险之旅 - 主要JavaScript文件
// 管理整个应用的状态和逻辑

class HTMLLearningApp {
    constructor() {
        this.currentUser = this.loadUserProgress();
        this.achievements = this.loadAchievements();
        this.init();
    }

    // 初始化应用
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.checkAchievements();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 页面加载完成后的处理
        document.addEventListener('DOMContentLoaded', () => {
            this.initializePage();
        });

        // 监听存储变化
        window.addEventListener('storage', (e) => {
            if (e.key.startsWith('htmlLearning')) {
                this.updateUI();
            }
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncProgress();
            }
        });
    }

    // 初始化页面
    initializePage() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initHomePage();
                break;
            case 'lesson':
                this.initLessonPage();
                break;
            case 'assessment':
                this.initAssessmentPage();
                break;
        }
    }

    // 获取当前页面
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('lesson')) return 'lesson';
        if (path.includes('assessment')) return 'assessment';
        return 'index';
    }

    // 初始化首页
    initHomePage() {
        this.updateProgressDisplay();
        this.showWelcomeMessage();
    }

    // 初始化课程页面
    initLessonPage() {
        const lessonNumber = this.getLessonNumber();
        this.markLessonVisited(lessonNumber);
        this.loadLessonProgress(lessonNumber);
    }

    // 初始化评估页面
    initAssessmentPage() {
        this.checkPrerequisites();
    }

    // 获取课程编号
    getLessonNumber() {
        const path = window.location.pathname;
        const match = path.match(/lesson(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // 加载用户进度
    loadUserProgress() {
        const saved = localStorage.getItem('htmlLearningProgress');
        return saved ? JSON.parse(saved) : {
            completedLessons: [],
            testScores: [],
            achievements: [],
            totalStudyTime: 0,
            lastVisit: null
        };
    }

    // 保存用户进度
    saveUserProgress() {
        localStorage.setItem('htmlLearningProgress', JSON.stringify(this.currentUser));
    }

    // 加载成就
    loadAchievements() {
        const saved = localStorage.getItem('htmlLearningAchievements');
        return saved ? JSON.parse(saved) : [];
    }

    // 保存成就
    saveAchievements() {
        localStorage.setItem('htmlLearningAchievements', JSON.stringify(this.achievements));
    }

    // 标记课程完成
    markLessonCompleted(lessonNumber) {
        if (!this.currentUser.completedLessons.includes(lessonNumber)) {
            this.currentUser.completedLessons.push(lessonNumber);
            this.saveUserProgress();
            this.showLessonCompletionMessage(lessonNumber);
            this.checkAchievements();
        }
    }

    // 标记课程已访问
    markLessonVisited(lessonNumber) {
        this.currentUser.lastVisit = new Date().toISOString();
        this.saveUserProgress();
    }

    // 加载课程进度
    loadLessonProgress(lessonNumber) {
        // 根据课程编号加载相应的进度数据
        const lessonProgress = localStorage.getItem(`lesson${lessonNumber}Progress`);
        if (lessonProgress) {
            // 恢复课程进度
            const progress = JSON.parse(lessonProgress);
            this.applyLessonProgress(progress);
        }
    }

    // 应用课程进度
    applyLessonProgress(progress) {
        // 恢复页面状态，如进度条、已完成的练习等
        if (progress.currentSection) {
            // 跳转到相应的学习进度
        }
        if (progress.completedActivities) {
            // 标记已完成的练习
        }
    }

    // 保存课程进度
    saveLessonProgress(lessonNumber, progress) {
        localStorage.setItem(`lesson${lessonNumber}Progress`, JSON.stringify(progress));
    }

    // 更新UI显示
    updateUI() {
        this.updateProgressDisplay();
        this.updateNavigationState();
        this.updateAchievementDisplay();
    }

    // 更新进度显示
    updateProgressDisplay() {
        const progressElements = document.querySelectorAll('[data-progress]');
        progressElements.forEach(element => {
            const progressType = element.dataset.progress;
            const progress = this.calculateProgress(progressType);
            this.displayProgress(element, progress);
        });
    }

    // 计算进度
    calculateProgress(type) {
        switch (type) {
            case 'overall':
                return (this.currentUser.completedLessons.length / 5) * 100;
            case 'test-average':
                return this.currentUser.testScores.length > 0 
                    ? this.currentUser.testScores.reduce((a, b) => a + b, 0) / this.currentUser.testScores.length
                    : 0;
            default:
                return 0;
        }
    }

    // 显示进度
    displayProgress(element, progress) {
        if (element.tagName === 'PROGRESS') {
            element.value = progress;
        } else {
            element.textContent = Math.round(progress) + '%';
        }
    }

    // 更新导航状态
    updateNavigationState() {
        const lessonCards = document.querySelectorAll('.lesson-card');
        lessonCards.forEach((card, index) => {
            const lessonNumber = index + 1;
            const isCompleted = this.currentUser.completedLessons.includes(lessonNumber);
            const isAccessible = this.isLessonAccessible(lessonNumber);
            
            if (isCompleted) {
                card.classList.add('completed');
            }
            
            if (!isAccessible) {
                card.style.opacity = '0.6';
                card.style.pointerEvents = 'none';
            }
        });
    }

    // 检查课程是否可访问
    isLessonAccessible(lessonNumber) {
        if (lessonNumber === 1) return true; // 第一课总是可访问
        
        // 检查是否完成了前置课程
        const prerequisites = {
            2: [1],
            3: [2],
            4: [3],
            5: [4]
        };
        
        const prereqs = prerequisites[lessonNumber] || [];
        return prereqs.every(prereq => this.currentUser.completedLessons.includes(prereq));
    }

    // 更新成就显示
    updateAchievementDisplay() {
        const achievementElements = document.querySelectorAll('[data-achievement]');
        achievementElements.forEach(element => {
            const achievementId = element.dataset.achievement;
            if (this.hasAchievement(achievementId)) {
                element.classList.add('earned');
            }
        });
    }

    // 检查是否获得成就
    hasAchievement(achievementId) {
        return this.achievements.includes(achievementId);
    }

    // 检查成就
    checkAchievements() {
        const newAchievements = [];
        
        // 课程完成成就
        if (this.currentUser.completedLessons.length >= 1 && !this.hasAchievement('first-lesson')) {
            newAchievements.push('first-lesson');
        }
        
        if (this.currentUser.completedLessons.length >= 3 && !this.hasAchievement('half-way')) {
            newAchievements.push('half-way');
        }
        
        if (this.currentUser.completedLessons.length >= 5 && !this.hasAchievement('all-lessons')) {
            newAchievements.push('all-lessons');
        }
        
        // 测试成就
        const avgScore = this.calculateProgress('test-average');
        if (avgScore >= 80 && !this.hasAchievement('high-scorer')) {
            newAchievements.push('high-scorer');
        }
        
        // 添加新成就
        newAchievements.forEach(achievement => {
            this.addAchievement(achievement);
        });
    }

    // 添加成就
    addAchievement(achievementId) {
        if (!this.hasAchievement(achievementId)) {
            this.achievements.push(achievementId);
            this.saveAchievements();
            this.showAchievementNotification(achievementId);
        }
    }

    // 显示成就通知
    showAchievementNotification(achievementId) {
        const achievementNames = {
            'first-lesson': '第一课完成',
            'half-way': '半程达人',
            'all-lessons': '课程大师',
            'high-scorer': '高分达人'
        };
        
        const name = achievementNames[achievementId] || '未知成就';
        this.showNotification(`🏆 获得新成就：${name}`, 'achievement');
    }

    // 显示课程完成消息
    showLessonCompletionMessage(lessonNumber) {
        const lessonNames = {
            1: 'HTML是什么？',
            2: 'HTML标签大冒险',
            3: '网页的身体结构',
            4: '超链接的魔法',
            5: '实战演练'
        };
        
        const name = lessonNames[lessonNumber] || `第${lessonNumber}课`;
        this.showNotification(`🎉 恭喜完成${name}！`, 'success');
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        const lastVisit = this.currentUser.lastVisit;
        const now = new Date();
        
        if (!lastVisit) {
            this.showNotification('欢迎来到HTML冒险之旅！开始你的学习之旅吧！', 'welcome');
        } else {
            const daysSinceLastVisit = Math.floor((now - new Date(lastVisit)) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastVisit > 7) {
                this.showNotification('欢迎回来！继续你的HTML学习之旅吧！', 'info');
            }
        }
    }

    // 检查先修条件
    checkPrerequisites() {
        const requiredLessons = [1, 2, 3, 4, 5];
        const completedRequired = requiredLessons.every(lesson => 
            this.currentUser.completedLessons.includes(lesson)
        );
        
        if (!completedRequired) {
            this.showNotification('请先完成所有课程再参加测试！', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // 同步进度
    syncProgress() {
        // 在实际应用中，这里可以同步服务器数据
        this.updateUI();
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 设置样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // 根据类型设置背景色
        const colors = {
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336',
            info: '#2196f3',
            achievement: '#9c27b0',
            welcome: '#00bcd4'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 获取用户统计信息
    getUserStats() {
        return {
            completedLessons: this.currentUser.completedLessons.length,
            totalLessons: 5,
            averageScore: this.calculateProgress('test-average'),
            totalStudyTime: this.currentUser.totalStudyTime,
            achievementCount: this.achievements.length,
            completionRate: this.calculateProgress('overall')
        };
    }

    // 导出学习数据
    exportProgress() {
        const data = {
            userProgress: this.currentUser,
            achievements: this.achievements,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'html-learning-progress.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showNotification('学习进度已导出！', 'success');
    }

    // 导入学习数据
    importProgress(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.userProgress && data.achievements) {
                    this.currentUser = data.userProgress;
                    this.achievements = data.achievements;
                    
                    this.saveUserProgress();
                    this.saveAchievements();
                    this.updateUI();
                    
                    this.showNotification('学习进度导入成功！', 'success');
                } else {
                    this.showNotification('文件格式不正确！', 'error');
                }
            } catch (error) {
                this.showNotification('文件解析失败！', 'error');
            }
        };
        
        reader.readAsText(file);
    }
}

// 创建全局应用实例
window.htmlLearningApp = new HTMLLearningApp();

// 导出一些常用函数供HTML页面使用
window.HTMLLearningUtils = {
    showNotification: (message, type) => window.htmlLearningApp.showNotification(message, type),
    markLessonCompleted: (lessonNumber) => window.htmlLearningApp.markLessonCompleted(lessonNumber),
    addAchievement: (achievementId) => window.htmlLearningApp.addAchievement(achievementId),
    getUserStats: () => window.htmlLearningApp.getUserStats(),
    exportProgress: () => window.htmlLearningApp.exportProgress(),
    importProgress: (file) => window.htmlLearningApp.importProgress(file)
};

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加全局键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl+H 显示帮助
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            window.HTMLLearningUtils.showNotification('快捷键：Ctrl+H 帮助，Ctrl+E 导出进度', 'info');
        }
        
        // Ctrl+E 导出进度
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            window.HTMLLearningUtils.exportProgress();
        }
    });
    
    // 添加全局错误处理
    window.addEventListener('error', (e) => {
        console.error('应用错误:', e.error);
        window.HTMLLearningUtils.showNotification('应用出现错误，请刷新页面重试。', 'error');
    });
    
    // 添加全局未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的Promise拒绝:', e.reason);
        window.HTMLLearningUtils.showNotification('操作失败，请重试。', 'error');
    });
});

// 导出应用类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLLearningApp;
}