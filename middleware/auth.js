/**
 * ============================================================
 *  登录验证中间件 - middleware/auth.js
 *  功能：检查用户是否已登录
 *  学习重点：中间件的概念，Session 验证
 *
 *  【什么是中间件？】
 *  中间件就是在请求到达路由处理函数之前执行的一个函数。
 *  它可以用来做：日志记录、登录验证、数据解析等。
 *  如果中间件调用了 next()，请求会继续往下走；
 *  如果调用了 res.redirect() 或 res.send()，请求就在这里停止了。
 * ============================================================ */

/**
 * 登录验证中间件
 * 检查 Session 中是否有 admin 信息
 * 如果有 → 说明已登录，继续处理请求 (next())
 * 如果没有 → 跳转到登录页面
 */
module.exports = function authMiddleware(req, res, next) {
  if (req.session && req.session.admin) {
    return next();  // 已登录，继续执行
  }
  res.redirect('/admin/login');  // 未登录，跳转到登录页
};
