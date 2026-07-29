/**
 * 相册渲染引擎
 * 自动读取 /gallery/data.json，生成 Butterfly 风格的相册墙 + 灯箱
 * 此文件不需要修改，只维护 data.json 即可
 */
(function() {
  'use strict';

  fetch('/gallery/data.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var root = document.getElementById('gallery-root');
      if (!root || !data.albums) return;

      // ========== 相册列表页 ==========
      var html = '<div class="gallery-header"><h1>📸 我的相册</h1>' +
        '<p class="gallery-subtitle">共 ' + data.albums.length + ' 个相册，记录旅途中的美好瞬间</p></div>' +
        '<div class="album-grid">';

      data.albums.forEach(function(album, index) {
        var photoCount = album.photos ? album.photos.length : 0;
        html += '<div class="album-card" data-album="' + index + '">' +
          '<div class="album-cover-wrap">' +
            '<img src="' + album.cover + '" alt="' + album.name + '" class="album-cover" loading="lazy">' +
            '<div class="album-overlay">' +
              '<span class="album-photo-count"><i class="fas fa-camera"></i> ' + photoCount + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="album-info">' +
            '<h3 class="album-name">' + album.name + '</h3>' +
            '<p class="album-desc">' + album.desc + '</p>' +
          '</div>' +
        '</div>';
      });

      html += '</div>';
      root.innerHTML = html;

      // 绑定点击事件
      root.querySelectorAll('.album-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-album'));
          openAlbum(data.albums[idx]);
        });
      });
    });

  // ========== 灯箱（打开某个相册） ==========
  function openAlbum(album) {
    var photos = album.photos;
    if (!photos || photos.length === 0) return;

    var overlay = document.createElement('div');
    overlay.className = 'gallery-lightbox';
    overlay.innerHTML =
      '<div class="gl-header">' +
        '<span class="gl-title">' + album.name + ' · 共 ' + photos.length + ' 张</span>' +
        '<button class="gl-close">&times;</button>' +
      '</div>' +
      '<div class="gl-body">' +
        '<button class="gl-nav gl-prev">&lsaquo;</button>' +
        '<div class="gl-main">' +
          '<img src="" alt="" class="gl-img">' +
          '<p class="gl-desc"></p>' +
        '</div>' +
        '<button class="gl-nav gl-next">&rsaquo;</button>' +
      '</div>' +
      '<div class="gl-thumbs"></div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 底部缩略图
    var thumbsBox = overlay.querySelector('.gl-thumbs');
    photos.forEach(function(p, i) {
      var t = document.createElement('div');
      t.className = 'gl-thumb';
      t.innerHTML = '<img src="' + p.url + '" alt="" loading="lazy">';
      t.addEventListener('click', function() { show(i); });
      thumbsBox.appendChild(t);
    });

    var cur = 0;
    var imgEl = overlay.querySelector('.gl-img');
    var descEl = overlay.querySelector('.gl-desc');
    var thumbEls = overlay.querySelectorAll('.gl-thumb');

    function show(i) {
      cur = i;
      imgEl.src = photos[i].url;
      descEl.textContent = photos[i].desc || '';
      thumbEls.forEach(function(el, idx) {
        el.classList.toggle('active', idx === i);
      });
      if (thumbEls[i]) {
        thumbEls[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    show(0);

    overlay.querySelector('.gl-prev').onclick = function(e) {
      e.stopPropagation();
      show((cur - 1 + photos.length) % photos.length);
    };
    overlay.querySelector('.gl-next').onclick = function(e) {
      e.stopPropagation();
      show((cur + 1) % photos.length);
    };

    function close() {
      overlay.classList.add('closing');
      setTimeout(function() {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
      }, 250);
    }

    overlay.querySelector('.gl-close').onclick = close;
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });

    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show((cur - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') show((cur + 1) % photos.length);
    }
    document.addEventListener('keydown', onKey);
  }
})();