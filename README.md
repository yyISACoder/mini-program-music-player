## 微信小程序版音乐播放器

由于本人喜欢听歌，因此就萌生了给自己做一个音乐播放器的念头😝，在网上看了几个视频，读了几篇文章后，就凭着一腔热情开始搞了😂

UI上参考了网易云和QQ音乐，然后加了一点自己的想法与设计。代码逻辑上就是完全靠自己来发挥了，凭着自己多年使用音乐播放器的经验，把播放器切碎成许多小的功能点，逐一击破，最终完成了这个作品。大致的切分逻辑如下：

* 歌单列表页
* 歌单详情页
* 歌曲搜索功能
* 热门搜索推荐
* 历史搜索记录
* 音频播放页
   * 音频播放动画
   * 音频控制功能
   * 评论、播放、相似歌曲列表
* 视频播放页

该项目采用 **微信原生语法** 开发，后台接口通过 [这个](https://github.com/yyISACoder/QQMusicApi) node项目来提供，我自己是采用 **pm2** 部署管理的，当然你可以选择任何你喜欢的方式😜

由于自己之前有开发小程序的经验，因此只花了大概五天的时间，最后的效果我还是基本满意的，以后就可以用自己开发的这个音乐播放器愉快地听歌咯🥰

最后的最后，如果你喜欢这个项目，请给一个 **star**⭐ 吧！

## 界面截图

### 首页

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/index.png)

### 搜索

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/serach.png)

### 搜索结果

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/search-res.png)

### 歌单详情

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/music-list.png)

### 音频播放页

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/play.png)

### 评论列表

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/comment.png)

### 播放记录

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/play-list.png)

### 视频播放页

![pic](https://github.com/yyISACoder/mini-program-music-player/blob/main/assets/images/video.png)
