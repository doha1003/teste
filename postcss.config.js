module.exports = {
  plugins: [
    require('postcss-import')({
      // PostCSS import 플러그인 설정
      // @import 문을 처리하여 파일들을 합침
    }),
    require('autoprefixer')({
      // 브라우저 호환성을 위한 벤더 프리픽스 추가
    }),
    require('cssnano')({
      // CSS 압축 및 최적화
      preset: 'default',
    })
  ]
}