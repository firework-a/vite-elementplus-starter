import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import process from 'node:process'

export default function injectConsoleInfo(): Plugin {
  return {
    name: 'inject-console-info',
    transformIndexHtml(html) {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
      const env = process.env.NODE_ENV || 'development'
      const isProd = env === 'production'
      const buildTime = new Date().toLocaleString()

      const script = `
        <script>
          // 初始化打印函数
          function printLog(message, ...styles) {
            if (typeof message === 'string' && styles.length === 1 && !message.includes('%c')) {
              // 单一消息和样式的情况
              console.log('%c' + message, styles[0]);
            } else {
              // 多个消息和样式的情况
              console.log(message, ...styles);
            }
          }

          // 主标题
          printLog(
            '%c${pkg.name} %cv${pkg.version}',
            'color: #52c41a; font-size: 14px; font-weight: bold; padding: 5px 0 5px 10px; background: #f0f9ff; border-radius: 4px 0 0 4px;',
            'color: #fff; font-size: 14px; font-weight: bold; padding: 5px; background: #52c41a; border-radius: 0 4px 4px 0;'
          );
          
          // 环境信息
          printLog(
            '%cEnvironment: %c${env}',
            'color: #fff; background: #d3d3d3; padding-left: 10px; font-weight: bold; border-radius: 2px;',
            'color: ${isProd ? '#ff4d4f' : '#52c41a'}; font-weight: bold;'
          );
          
          // 构建时间
          printLog(
            '%cBuild Time: %c${buildTime}',
            'color: #fff; background: #d3d3d3; padding-left: 10px; font-weight: bold; border-radius: 2px;',
            'color: #722ed1;'
          );

          // 性能监测
          function measurePerformance() {
            try {
              const navigationEntry = performance.getEntriesByType('navigation')[0] || {};
              const paintEntries = performance.getEntriesByType('paint');
              
              const toMs = (value = 0) => Math.max(0, Number(value) || 0);
              const metrics = [
                { name: 'Page Load', value: toMs(navigationEntry.loadEventEnd - navigationEntry.startTime) },
                { name: 'DOM Ready', value: toMs(navigationEntry.domComplete - navigationEntry.domInteractive) },
                { name: 'Network', value: toMs(navigationEntry.responseEnd - navigationEntry.requestStart) },
                { name: 'TTFB', value: toMs(navigationEntry.responseStart - navigationEntry.startTime) }
              ];
              
              // 打印性能指标标题
              printLog('性能指标:', 'font-weight: bold; font-size: 14px; color: #333;');
              
              // 打印各项指标
              metrics.forEach(metric => {
                const color = metric.value < 100 ? '#52c41a' : 
                            metric.value < 500 ? '#1890ff' : '#ff4d4f';
                printLog(
                  metric.name.padEnd(10) + ': ' + metric.value.toFixed(2) + 'ms',
                  'color: ' + color + '; font-weight: bold;'
                );
              });
              
              // 打印FP/FCP
              paintEntries.forEach(entry => {
                printLog(
                  entry.name.toUpperCase().padEnd(10) + ': ' + entry.startTime.toFixed(2) + 'ms',
                  'color: #faad14; font-weight: bold;'
                );
              });
              
              // 异常检测
              if (metrics[0].value < 1) {
                printLog(
                  '⚠️ 测量异常：极短的加载时间\\n' +
                  '可能原因：\\n' +
                  '1. 测量时机过早\\n' + 
                  '2. 浏览器隐私限制\\n' +
                  '3. 开发模式热更新',
                  'color: #ff4d4f; font-weight: bold;'
                );
              }
            } catch (e) {
              printLog('Performance API不可用', 'color: #ff4d4f');
            }
            
            // 最后打印祝福语
            printLog(
              'Happy Coding! 🚀',
              'color: #faad14; font-size: 14px; font-style: italic;'
            );
          }
          
          // 启动测量
          if (document.readyState === 'complete') {
            setTimeout(measurePerformance, 0);
          } else {
            window.addEventListener('load', function() {
              setTimeout(measurePerformance, 0);
            }, { once: true });
          }
        </script>
      `
      return html.replace('</head>', script)
    },
  }
}
