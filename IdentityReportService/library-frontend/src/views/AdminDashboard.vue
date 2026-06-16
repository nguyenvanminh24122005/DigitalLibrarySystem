<template>
  <v-app style="background-color: #f3f4f6;">
    <!-- SIDEBAR -->
    <v-navigation-drawer
      permanent
      width="250"
      theme="dark"
      border="0"
      style="background-color: #064e40;"
    >
      <div class="px-5 py-6 d-flex align-center">
        <v-avatar color="#ffffff" size="36" class="mr-3 rounded-lg">
          <v-icon color="#0d9488" size="24">mdi-book-open-page-variant</v-icon>
        </v-avatar>

        <div>
          <div
            class="text-subtitle-2 font-weight-bold text-white tracking-tight"
            style="line-height: 1.2;"
          >
            Digital Library
          </div>
          <div
            class="text-caption text-teal-lighten-4"
            style="font-size: 0.65rem !important;"
          >
            Hệ thống quản lý thư viện số
          </div>
        </div>
      </div>

      <v-list density="compact" nav class="px-3">
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :value="item.value"
          :active="currentMenu === item.value"
          :class="currentMenu === item.value ? 'active-menu-item mb-1' : 'mb-1'"
          rounded="lg"
          @click="currentMenu = item.value"
        >
          <template #prepend>
            <v-icon
              :icon="item.icon"
              :color="currentMenu === item.value ? 'white' : 'teal-lighten-3'"
              size="20"
              class="mr-3"
            />
          </template>

          <v-list-item-title class="font-weight-medium text-body-2 text-teal-lighten-4">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-3">
          <v-menu
            v-model="sidebarUserMenu"
            location="top end"
            offset="12"
            :close-on-content-click="false"
          >
            <template #activator="{ props }">
              <button v-bind="props" class="sidebar-user-btn" type="button">
                <v-avatar size="38" color="#ccfbf1" class="mr-3 border-white border admin-head-avatar">
                  <v-icon color="#0d9488" size="24">mdi-account</v-icon>
                </v-avatar>

                <div class="sidebar-user-text">
                  <strong>{{ adminProfile.name }}</strong>
                  <span>{{ adminProfile.role }}</span>
                </div>

                <v-icon color="teal-lighten-3" size="20">mdi-chevron-up</v-icon>
              </button>
            </template>

            <v-card class="account-menu-card" elevation="10">
              <div class="account-menu-head">
                <v-avatar size="52" color="#ccfbf1" class="admin-head-avatar">
                  <v-icon color="#0d9488" size="30">mdi-account</v-icon>
                </v-avatar>

                <div>
                  <h4>{{ adminProfile.name }}</h4>
                  <p>{{ adminProfile.email }}</p>
                </div>
              </div>

              <v-divider />

              <button class="account-menu-item" @click="openProfileDialog">
                <v-icon size="21">mdi-account-circle-outline</v-icon>
                Hồ sơ cá nhân
              </button>

              <button class="account-menu-item" @click="goToSettings">
                <v-icon size="21">mdi-cog-outline</v-icon>
                Cài đặt tài khoản
              </button>

              <button class="account-menu-item" @click="markAllNotificationsRead">
                <v-icon size="21">mdi-bell-check-outline</v-icon>
                Đánh dấu đã đọc thông báo
              </button>

              <v-divider />

              <button class="account-menu-item logout" @click="logoutUser">
                <v-icon size="21">mdi-logout</v-icon>
                Đăng xuất
              </button>
            </v-card>
          </v-menu>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- HEADER -->
    <v-app-bar flat color="transparent" height="70" class="px-6">
      <div>
        <h2
          class="text-h5 font-weight-bold text-grey-darken-4 mb-0"
          style="line-height: 1;"
        >
          {{ currentMenuTitle }}
        </h2>

        <div class="text-caption text-grey-darken-1 font-weight-medium mt-1">
          <span class="text-teal-darken-2 font-weight-bold">Trang chủ</span>
          <v-icon size="14" class="mx-1">mdi-chevron-right</v-icon>
          <span>{{ currentMenuTitle }}</span>
        </div>
      </div>

      <v-spacer />

      <div class="d-flex align-center dashboard-header-actions">
        <!-- TÌM KIẾM NHANH -->
        <v-menu
          v-model="searchMenu"
          location="bottom end"
          offset="10"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="quick-search-wrap mr-4">
              <v-text-field
                v-model="quickSearch"
                placeholder="Tìm kiếm nhanh..."
                variant="outlined"
                density="compact"
                bg-color="white"
                hide-details
                rounded="pill"
                append-inner-icon="mdi-magnify"
                class="search-input"
                style="width: 280px;"
                @focus="searchMenu = true"
                @click:append-inner="handleQuickSearch"
                @keyup.enter="handleQuickSearch"
              />
            </div>
          </template>

          <v-card class="quick-search-menu" elevation="10">
            <div class="search-menu-head">
              <strong>Kết quả tìm kiếm</strong>
              <span>{{ quickSearchResults.length }} kết quả</span>
            </div>

            <div v-if="quickSearchResults.length > 0" class="search-result-list">
              <button
                v-for="result in quickSearchResults"
                :key="result.id"
                class="search-result-item"
                @click="openSearchResult(result)"
              >
                <span :style="{ background: result.bg, color: result.color }">
                  <v-icon size="21">{{ result.icon }}</v-icon>
                </span>

                <div>
                  <strong>{{ result.title }}</strong>
                  <small>{{ result.desc }}</small>
                </div>
              </button>
            </div>

            <div v-else class="search-empty-state">
              <v-icon size="42" color="grey-lighten-1">mdi-magnify</v-icon>
              <p>Nhập tên chức năng, độc giả, tài liệu hoặc mã phiếu để tìm.</p>
            </div>
          </v-card>
        </v-menu>

        <!-- THÔNG BÁO -->
        <v-menu
          v-model="notificationMenu"
          location="bottom end"
          offset="10"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <v-badge
              :content="unreadNotificationCount"
              :model-value="unreadNotificationCount > 0"
              color="red"
              offset-x="8"
              offset-y="8"
              class="mr-4"
            >
              <v-btn
                v-bind="props"
                icon="mdi-bell-outline"
                variant="outlined"
                color="grey-darken-1"
                bg-color="white"
                size="40"
                class="rounded-circle bg-white notification-btn"
              />
            </v-badge>
          </template>

          <v-card class="notification-menu-card" elevation="10">
            <div class="notification-head">
              <div>
                <h3>Thông báo</h3>
                <p>{{ unreadNotificationCount }} thông báo chưa đọc</p>
              </div>

              <button @click="markAllNotificationsRead">Đánh dấu đã đọc</button>
            </div>

            <div class="notification-list">
              <button
                v-for="item in headerNotifications"
                :key="item.id"
                class="notification-item"
                :class="{ unread: !item.read }"
                @click="openNotification(item)"
              >
                <span class="noti-icon" :style="{ background: item.bg, color: item.color }">
                  <v-icon size="22">{{ item.icon }}</v-icon>
                </span>

                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.message }}</p>
                  <small>{{ item.time }}</small>
                </div>
              </button>
            </div>

            <v-divider />

            <button class="notification-footer" @click="currentMenu = 'notifications'; notificationMenu = false">
              Xem tất cả thông báo
              <v-icon size="18">mdi-arrow-right</v-icon>
            </button>
          </v-card>
        </v-menu>

        <!-- AVATAR MENU -->
        <v-menu
          v-model="avatarMenu"
          location="bottom end"
          offset="10"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <button v-bind="props" class="avatar-menu-btn" type="button">
              <v-avatar size="40" color="#ccfbf1" class="border admin-head-avatar">
                <v-icon color="#0d9488" size="25">mdi-account</v-icon>
              </v-avatar>
              <v-icon size="18" color="grey-darken-1">mdi-chevron-down</v-icon>
            </button>
          </template>

          <v-card class="account-menu-card" elevation="10">
            <div class="account-menu-head">
              <v-avatar size="54" color="#ccfbf1" class="admin-head-avatar">
                <v-icon color="#0d9488" size="31">mdi-account</v-icon>
              </v-avatar>

              <div>
                <h4>{{ adminProfile.name }}</h4>
                <p>{{ adminProfile.email }}</p>
              </div>
            </div>

            <v-divider />

            <button class="account-menu-item" @click="openProfileDialog">
              <v-icon size="21">mdi-account-circle-outline</v-icon>
              Hồ sơ cá nhân
            </button>

            <button class="account-menu-item" @click="goToSettings">
              <v-icon size="21">mdi-cog-outline</v-icon>
              Cài đặt tài khoản
            </button>

            <button class="account-menu-item" @click="currentMenu = 'notifications'; avatarMenu = false">
              <v-icon size="21">mdi-bell-outline</v-icon>
              Thông báo của tôi
            </button>

            <v-divider />

            <button class="account-menu-item logout" @click="logoutUser">
              <v-icon size="21">mdi-logout</v-icon>
              Đăng xuất
            </button>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- PROFILE DIALOG -->
    <v-dialog v-model="profileDialog" max-width="720">
      <v-card class="profile-dialog-card" elevation="0">
        <div class="profile-dialog-cover"></div>

        <div class="profile-dialog-body">
          <div class="profile-dialog-head">
            <v-avatar size="96" color="#ccfbf1" class="profile-dialog-avatar admin-head-avatar">
              <v-icon color="#0d9488" size="58">mdi-account</v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <h2>{{ adminProfile.name }}</h2>
              <p>{{ adminProfile.role }} - {{ adminProfile.service }}</p>
            </div>

            <v-btn icon="mdi-close" variant="text" @click="profileDialog = false" />
          </div>

          <div class="profile-info-grid">
            <div>
              <span>Email</span>
              <strong>{{ adminProfile.email }}</strong>
            </div>

            <div>
              <span>Số điện thoại</span>
              <strong>{{ adminProfile.phone }}</strong>
            </div>

            <div>
              <span>Vai trò</span>
              <strong>{{ adminProfile.role }}</strong>
            </div>

            <div>
              <span>Trạng thái</span>
              <strong class="text-teal-darken-2">Đang hoạt động</strong>
            </div>

            <div>
              <span>Dịch vụ phụ trách</span>
              <strong>{{ adminProfile.service }}</strong>
            </div>

            <div>
              <span>Đăng nhập gần nhất</span>
              <strong>{{ adminProfile.lastLogin }}</strong>
            </div>
          </div>

          <div class="profile-dialog-actions">
            <v-btn
              variant="outlined"
              color="#0d9488"
              class="text-none font-weight-bold"
              prepend-icon="mdi-cog-outline"
              @click="goToSettings"
            >
              Cài đặt tài khoản
            </v-btn>

            <v-btn
              color="red"
              variant="outlined"
              class="text-none font-weight-bold"
              prepend-icon="mdi-logout"
              @click="logoutUser"
            >
              Đăng xuất
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- MAIN -->
    <v-main style="height: calc(100vh - 75px); overflow-y: auto;">
      <v-container fluid class="px-6 py-2" style="max-width: 1600px;">
        <!-- ================= TỔNG QUAN ================= -->
        <div v-if="currentMenu === 'overview'" class="overview-v3">
          <!-- KPI CARDS -->
          <v-row class="mb-4 overview-kpi-row">
            <v-col v-for="kpi in overviewKpis" :key="kpi.title" cols="12" sm="6" lg="3">
              <div class="overview-kpi-card">
                <div class="overview-kpi-icon" :style="{ background: kpi.bg }">
                  <v-icon :color="kpi.color" size="34">{{ kpi.icon }}</v-icon>
                </div>

                <div class="overview-kpi-info">
                  <p>{{ kpi.title }}</p>
                  <h2 :style="{ color: kpi.color }">{{ kpi.value }}</h2>

                  <span :class="{ down: kpi.down }">
                    <v-icon size="15">{{ kpi.down ? 'mdi-arrow-down-right' : 'mdi-arrow-up-right' }}</v-icon>
                    {{ kpi.trend }}
                  </span>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- MAIN CHARTS -->
          <v-row class="mb-4">
            <!-- LINE CHART -->
            <v-col cols="12" lg="6">
              <div class="overview-panel chart-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#0d9488" size="24" class="mr-2">mdi-chart-line</v-icon>
                    <h3>Lưu lượng mượn - trả trong 7 ngày qua</h3>
                  </div>

                  <select v-model="overviewChartRange" class="overview-small-select">
                    <option>7 ngày qua</option>
                    <option>Tháng này</option>
                  </select>
                </div>

                <div class="overview-line-chart">
                  <svg viewBox="0 0 700 270" preserveAspectRatio="none">
                    <line v-for="line in 6" :key="line" x1="0" :y1="line * 42" x2="700" :y2="line * 42" stroke="#eef2f7" stroke-width="1" />

                    <polyline :points="overviewBorrowPolyline" fill="none" stroke="#0d9488" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                    <polyline :points="overviewReturnPolyline" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

                    <g v-for="point in overviewBorrowPoints" :key="`borrow-${point.day}`">
                      <circle :cx="point.x" :cy="point.y" r="7" fill="#0d9488" stroke="#ffffff" stroke-width="4" />
                      <text :x="point.x" :y="point.y - 16" text-anchor="middle" fill="#0d9488" font-size="20" font-weight="800">
                        {{ point.value }}
                      </text>
                    </g>

                    <g v-for="point in overviewReturnPoints" :key="`return-${point.day}`">
                      <circle :cx="point.x" :cy="point.y" r="7" fill="#2563eb" stroke="#ffffff" stroke-width="4" />
                      <text :x="point.x" :y="point.y + 30" text-anchor="middle" fill="#2563eb" font-size="20" font-weight="800">
                        {{ point.value }}
                      </text>
                    </g>
                  </svg>

                  <div class="overview-x-labels">
                    <span v-for="item in overviewBorrowReturn" :key="item.day">{{ item.day }}</span>
                  </div>
                </div>

                <div class="overview-chart-legend">
                  <span><i class="borrow"></i>Lượt mượn</span>
                  <span><i class="return"></i>Lượt trả</span>
                </div>
              </div>
            </v-col>

            <!-- DONUT -->
            <v-col cols="12" lg="3">
              <div class="overview-panel overview-status-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#0d9488" size="24" class="mr-2">mdi-chart-donut</v-icon>
                    <h3>Tỷ lệ trạng thái mượn trả</h3>
                  </div>
                </div>

                <div class="overview-donut-wrap">
                  <div class="overview-donut" :style="{ background: overviewDonutBg }">
                    <div class="overview-donut-hole">
                      <span>Tổng số</span>
                      <strong>{{ overviewStatusTotal }}</strong>
                    </div>
                  </div>

                  <div class="overview-donut-list">
                    <div v-for="item in overviewStatusStats" :key="item.label">
                      <span>
                        <i :style="{ background: item.color }"></i>
                        {{ item.label }}
                      </span>
                      <b>{{ item.value }} ({{ overviewPercent(item.value) }}%)</b>
                    </div>
                  </div>
                </div>

                <button class="overview-link-btn" @click="currentMenu = 'reports'">
                  Xem chi tiết báo cáo
                  <v-icon size="18">mdi-arrow-right</v-icon>
                </button>
              </div>
            </v-col>

            <!-- OVERDUE -->
            <v-col cols="12" lg="3">
              <div class="overview-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#ef4444" size="24" class="mr-2">mdi-alert-outline</v-icon>
                    <h3>Cảnh báo quá hạn</h3>
                  </div>

                  <button class="overview-text-link" @click="currentMenu = 'history'">Xem tất cả</button>
                </div>

                <div class="overview-alert-list">
                  <div v-for="alert in overviewFilteredOverdues" :key="alert.name" class="overview-alert-item">
                    <v-avatar size="44" class="mr-3">
                      <v-img :src="alert.avatar" />
                    </v-avatar>

                    <div class="flex-grow-1">
                      <strong>{{ alert.name }}</strong>
                      <span>{{ alert.book }}</span>
                    </div>

                    <b>Trễ {{ alert.days }} ngày</b>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- LOWER GRID -->
          <v-row>
            <!-- TOP BOOKS -->
            <v-col cols="12" lg="4">
              <div class="overview-panel lower-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#0d9488" size="24" class="mr-2">mdi-trophy-outline</v-icon>
                    <h3>Top 5 sách được mượn nhiều</h3>
                  </div>

                  <button class="overview-text-link" @click="currentMenu = 'reports'">Xem tất cả</button>
                </div>

                <div class="overview-book-list">
                  <div v-for="book in overviewFilteredTopBooks" :key="book.title" class="overview-book-row">
                    <span class="rank-badge" :class="`rank-${book.rank}`">{{ book.rank }}</span>

                    <img :src="book.cover" :alt="book.title" />

                    <div class="flex-grow-1">
                      <strong>{{ book.title }}</strong>
                      <span>{{ book.author }}</span>
                      <div class="book-progress">
                        <i :style="{ width: book.percent + '%', background: book.color }"></i>
                      </div>
                    </div>

                    <b>{{ book.count }}</b>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- CATEGORY STATS -->
            <v-col cols="12" lg="4">
              <div class="overview-panel lower-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#0d9488" size="24" class="mr-2">mdi-shape-outline</v-icon>
                    <h3>Thống kê theo loại tài liệu</h3>
                  </div>

                  <button class="overview-text-link" @click="currentMenu = 'reports'">Xem tất cả</button>
                </div>

                <div class="overview-category-list">
                  <div v-for="cat in overviewCategories" :key="cat.name">
                    <div class="category-head">
                      <strong>{{ cat.name }}</strong>
                      <span>{{ cat.count }} tài liệu</span>
                    </div>

                    <div class="category-progress">
                      <i :style="{ width: cat.percent + '%', background: cat.color }"></i>
                    </div>

                    <small>{{ cat.percent }}%</small>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- ACTIVITY + QUICK ACTIONS -->
            <v-col cols="12" lg="4">
              <div class="overview-panel lower-panel">
                <div class="overview-panel-head">
                  <div class="d-flex align-center">
                    <v-icon color="#0d9488" size="24" class="mr-2">mdi-timeline-clock-outline</v-icon>
                    <h3>Lịch sử hoạt động gần đây</h3>
                  </div>

                  <button class="overview-text-link" @click="showOverviewActivities">Xem tất cả</button>
                </div>

                <div class="overview-timeline">
                  <div v-for="item in overviewActivities" :key="item.time + item.title">
                    <span>{{ item.time }}</span>
                    <i></i>
                    <div>
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.desc }}</p>
                    </div>
                  </div>
                </div>

                <div class="overview-quick-actions">
                  <button v-for="action in overviewQuickActions" :key="action.title" @click="runOverviewAction(action)">
                    <span :style="{ background: action.bg, color: action.color }">
                      <v-icon size="24">{{ action.icon }}</v-icon>
                    </span>
                    <b>{{ action.title }}</b>
                  </button>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>



        <!-- ================= QUẢN LÝ SÁCH - CATALOG SERVICE NHÓM 1 ================= -->
        <div v-if="currentMenu === 'books'" class="catalog-inline-page">
          <!-- HERO -->
          <section class="catalog-inline-hero">
            <div class="catalog-hero-left">
              <span class="catalog-hero-chip">
                <v-icon size="18">mdi-database-cog-outline</v-icon>
                Catalog Service - Nhóm 1
              </span>

              <h1>Quản lý kho sách thư viện</h1>

              <p>
                Quản lý toàn bộ đầu sách, bản sao, tình trạng mượn và thông tin liên quan.
                Thêm mới, cập nhật, tìm kiếm và theo dõi dễ dàng.
              </p>

              <div class="catalog-hero-actions">
                <button type="button" class="catalog-add-btn" @click="catalogOpenCreateBook">
                  <v-icon size="22">mdi-plus</v-icon>
                  Thêm sách
                </button>

                <button type="button" class="catalog-reload-btn" @click="catalogLoadBooks">
                  <v-icon size="21">mdi-refresh</v-icon>
                  Tải lại từ API
                </button>
              </div>
            </div>

            <div class="catalog-hero-art">
              <div class="catalog-art-book-stack">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div class="catalog-art-open-book"></div>
            </div>
          </section>

          <!-- KPI -->
          <section class="catalog-kpi-grid">
            <article class="catalog-kpi-card green">
              <span>
                <v-icon size="32">mdi-book-open-page-variant</v-icon>
              </span>

              <div>
                <p>Đầu sách</p>
                <h2>{{ catalogStats.total.toLocaleString('vi-VN') }}</h2>
                <small>Tổng số đầu sách trong kho</small>
              </div>
            </article>

            <article class="catalog-kpi-card blue">
              <span>
                <v-icon size="32">mdi-check-circle-outline</v-icon>
              </span>

              <div>
                <p>Có thể mượn</p>
                <h2>{{ catalogStats.available.toLocaleString('vi-VN') }}</h2>
                <small>Sách sẵn sàng cho mượn</small>
              </div>
            </article>

            <article class="catalog-kpi-card orange">
              <span>
                <v-icon size="32">mdi-alert-circle-outline</v-icon>
              </span>

              <div>
                <p>Sắp hết / Hết sách</p>
                <h2>{{ catalogStats.warning.toLocaleString('vi-VN') }}</h2>
                <small>Cần bổ sung kịp thời</small>
              </div>
            </article>

            <article class="catalog-kpi-card purple">
              <span>
                <v-icon size="32">mdi-layers-triple-outline</v-icon>
              </span>

              <div>
                <p>Tổng bản sao</p>
                <h2>{{ catalogStats.copies.toLocaleString('vi-VN') }}</h2>
                <small>Tổng số bản sao hiện có</small>
              </div>
            </article>
          </section>

          <!-- FILTER -->
          <section class="catalog-filter-card">
            <div class="catalog-main-search">
              <v-icon size="23">mdi-magnify</v-icon>

              <input
                v-model="catalogFilters.keyword"
                placeholder="Tìm theo tên sách, tác giả, ISBN..."
                @keyup.enter="catalogSearchBooks"
              />

              <button
                v-if="catalogFilters.keyword"
                type="button"
                @click="catalogClearSearch"
              >
                <v-icon size="18">mdi-close</v-icon>
              </button>
            </div>

            <select v-model="catalogFilters.category">
              <option value="">Thể loại</option>
              <option
                v-for="category in catalogCategoryOptions"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <select v-model="catalogFilters.year">
              <option value="">Năm XB</option>
              <option
                v-for="year in catalogYearOptions"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </select>

            <button class="catalog-filter-search-btn" type="button" @click="catalogSearchBooks">
              <v-icon size="21">mdi-magnify</v-icon>
              Tìm kiếm
            </button>
          </section>

          <!-- TABLE -->
          <section class="catalog-table-card">
            <div class="catalog-table-top">
              <div>
                <p>
                  Tổng số
                  <b>{{ catalogFilteredBooks.length.toLocaleString('vi-VN') }}</b>
                  sách
                </p>

                <small>
                  Gọi API trực tiếp từ Catalog Service:
                  {{ catalogApiBaseUrl }}
                </small>
              </div>

              <div class="catalog-table-tools">
                <button type="button" @click="catalogShowFilterPanel = !catalogShowFilterPanel">
                  <v-icon size="19">mdi-filter-variant</v-icon>
                  Bộ lọc
                </button>

                <select v-model="catalogSortMode">
                  <option value="newest">Sắp xếp: Mới nhất</option>
                  <option value="title">Sắp xếp: Tên A-Z</option>
                  <option value="available">Sắp xếp: Còn nhiều nhất</option>
                  <option value="year">Sắp xếp: Năm XB mới nhất</option>
                </select>
              </div>
            </div>

            <div v-if="catalogShowFilterPanel" class="catalog-advanced-filter">
              <button
                type="button"
                :class="{ active: catalogStatusFilter === 'all' }"
                @click="catalogStatusFilter = 'all'"
              >
                Tất cả
              </button>

              <button
                type="button"
                :class="{ active: catalogStatusFilter === 'available' }"
                @click="catalogStatusFilter = 'available'"
              >
                Có thể mượn
              </button>

              <button
                type="button"
                :class="{ active: catalogStatusFilter === 'low' }"
                @click="catalogStatusFilter = 'low'"
              >
                Sắp hết
              </button>

              <button
                type="button"
                :class="{ active: catalogStatusFilter === 'out' }"
                @click="catalogStatusFilter = 'out'"
              >
                Hết sách
              </button>
            </div>

            <div v-if="catalogIsLoading" class="catalog-state-card">
              <v-progress-circular indeterminate color="#0d9488" size="48" />
              <h3>Đang tải dữ liệu từ Catalog Service...</h3>
            </div>

            <div v-else-if="catalogFilteredBooks.length === 0" class="catalog-state-card">
              <v-icon size="68" color="#94a3b8">mdi-book-off-outline</v-icon>
              <h3>Chưa có sách để hiển thị</h3>
              <p>
                Backend nhóm 1 chưa chạy hoặc chưa có dữ liệu.
                Bạn có thể bấm “Thêm sách” để tạo dữ liệu mới.
              </p>
            </div>

            <div v-else class="catalog-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        :checked="catalogIsAllSelected"
                        @change="catalogToggleSelectAll"
                      />
                    </th>
                    <th>Ảnh bìa</th>
                    <th>ISBN</th>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>NXB</th>
                    <th>Năm XB</th>
                    <th>Bản sao</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="book in catalogPaginatedBooks" :key="book.id">
                    <td>
                      <input v-model="catalogSelectedIds" type="checkbox" :value="book.id" />
                    </td>

                    <td>
                      <div class="catalog-book-cover">
                        <img
                          v-if="book.coverImage"
                          :src="book.coverImage"
                          :alt="book.title"
                          @error="catalogOnCoverError"
                        />
                        <v-icon v-else size="26">mdi-book-open-page-variant</v-icon>
                      </div>
                    </td>

                    <td class="catalog-isbn-cell">{{ book.isbn || '---' }}</td>

                    <td class="catalog-title-cell">
                      <strong>{{ book.title || 'Chưa có tiêu đề' }}</strong>
                      <small>{{ book.category || 'Chưa phân loại' }}</small>
                    </td>

                    <td>{{ book.author || '---' }}</td>
                    <td>{{ book.publisher || '---' }}</td>
                    <td>{{ book.year || '---' }}</td>

                    <td>
                      <b>{{ book.availableCopies }} / {{ book.totalCopies }}</b>
                    </td>

                    <td>
                      <span class="catalog-status-pill" :class="book.status">
                        {{ catalogStatusText(book.status) }}
                      </span>
                    </td>

                    <td>
                      <div class="catalog-row-actions">
                        <button type="button" title="Xem chi tiết" @click="catalogOpenViewBook(book)">
                          <v-icon size="18">mdi-eye-outline</v-icon>
                        </button>

                        <button type="button" title="Sửa sách" @click="catalogOpenEditBook(book)">
                          <v-icon size="18">mdi-pencil-outline</v-icon>
                        </button>

                        <button type="button" title="Quản lý bản sao" @click="catalogOpenCopiesDialog(book)">
                          <v-icon size="18">mdi-content-copy</v-icon>
                        </button>

                        <button type="button" class="delete" title="Xóa sách" @click="catalogDeleteBook(book)">
                          <v-icon size="18">mdi-trash-can-outline</v-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="catalogFilteredBooks.length > 0" class="catalog-pagination-bar">
              <span>
                Hiển thị {{ catalogStartIndex + 1 }}-{{ catalogEndIndex }}
                trên {{ catalogFilteredBooks.length.toLocaleString('vi-VN') }} sách
              </span>

              <div class="catalog-pagination-actions">
                <button
                  type="button"
                  :disabled="catalogPage === 1"
                  @click="catalogPage--"
                >
                  <v-icon size="18">mdi-chevron-left</v-icon>
                </button>

                <button
                  v-for="item in catalogVisiblePages"
                  :key="item"
                  type="button"
                  :class="{ active: item === catalogPage }"
                  @click="catalogPage = item"
                >
                  {{ item }}
                </button>

                <button
                  type="button"
                  :disabled="catalogPage === catalogTotalPages"
                  @click="catalogPage++"
                >
                  <v-icon size="18">mdi-chevron-right</v-icon>
                </button>

                <select v-model.number="catalogPerPage">
                  <option :value="5">5 / trang</option>
                  <option :value="10">10 / trang</option>
                  <option :value="20">20 / trang</option>
                </select>
              </div>
            </div>
          </section>

          <!-- EVENTS -->
          <section class="catalog-event-card">
            <div class="catalog-event-head">
              <h3>Event book.availability.changed</h3>
              <span>{{ catalogEvents.length }} event</span>
            </div>

            <div v-if="catalogEvents.length === 0" class="catalog-event-empty">
              Chưa có event nào được ghi nhận từ giao diện.
            </div>

            <div v-else class="catalog-event-list">
              <div v-for="event in catalogEvents" :key="event.id">
                <v-icon size="19">mdi-broadcast</v-icon>
                <div>
                  <b>{{ event.type }}</b>
                  <p>{{ event.bookTitle }} - {{ event.message }}</p>
                  <small>{{ new Date(event.createdAt).toLocaleString('vi-VN') }}</small>
                </div>
              </div>
            </div>
          </section>

          <!-- BOOK FORM DIALOG -->
          <v-dialog v-model="catalogBookDialog" max-width="820">
            <v-card class="catalog-dialog-card">
              <div class="catalog-dialog-head">
                <div>
                  <h2>{{ catalogEditingBookId ? 'Cập nhật sách' : 'Thêm sách mới' }}</h2>
                  <p>{{ catalogEditingBookId ? 'PUT /api/books/{id}' : 'POST /api/books' }}</p>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="catalogBookDialog = false" />
              </div>

              <div class="catalog-form-grid">
                <label>
                  ISBN
                  <input v-model.trim="catalogBookForm.isbn" placeholder="VD: 9786044830348" />
                </label>

                <label>
                  Tiêu đề
                  <input v-model.trim="catalogBookForm.title" placeholder="Tên sách" />
                </label>

                <label>
                  Tác giả
                  <input v-model.trim="catalogBookForm.author" placeholder="Tác giả" />
                </label>

                <label>
                  Nhà xuất bản
                  <input v-model.trim="catalogBookForm.publisher" placeholder="NXB" />
                </label>

                <label>
                  Năm XB
                  <input v-model.number="catalogBookForm.year" type="number" placeholder="2024" />
                </label>

                <label>
                  Thể loại
                  <input v-model.trim="catalogBookForm.category" placeholder="Văn học, Công nghệ..." />
                </label>

                <label>
                  Tổng bản sao
                  <input v-model.number="catalogBookForm.totalCopies" type="number" min="0" />
                </label>

                <label>
                  Có thể mượn
                  <input v-model.number="catalogBookForm.availableCopies" type="number" min="0" />
                </label>

                <label class="full">
                  Ảnh bìa URL
                  <input v-model.trim="catalogBookForm.coverImage" placeholder="https://..." />
                </label>

                <label class="full">
                  Mô tả
                  <textarea
                    v-model.trim="catalogBookForm.description"
                    rows="3"
                    placeholder="Mô tả ngắn về sách"
                  ></textarea>
                </label>
              </div>

              <div class="catalog-dialog-actions">
                <button type="button" class="catalog-cancel-btn" @click="catalogBookDialog = false">
                  Hủy
                </button>

                <button type="button" class="catalog-save-btn" @click="catalogSaveBook">
                  <v-icon size="19">mdi-content-save-outline</v-icon>
                  {{ catalogEditingBookId ? 'Lưu thay đổi' : 'Thêm sách' }}
                </button>
              </div>
            </v-card>
          </v-dialog>

          <!-- VIEW DIALOG -->
          <v-dialog v-model="catalogViewDialog" max-width="720">
            <v-card class="catalog-dialog-card">
              <div class="catalog-dialog-head">
                <div>
                  <h2>Chi tiết sách</h2>
                  <p>GET /api/books/{id}</p>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="catalogViewDialog = false" />
              </div>

              <div v-if="catalogSelectedBook" class="catalog-book-detail">
                <div class="catalog-detail-cover">
                  <img
                    v-if="catalogSelectedBook.coverImage"
                    :src="catalogSelectedBook.coverImage"
                    :alt="catalogSelectedBook.title"
                  />
                  <v-icon v-else size="60">mdi-book-open-page-variant</v-icon>
                </div>

                <div class="catalog-detail-info">
                  <span class="catalog-status-pill" :class="catalogSelectedBook.status">
                    {{ catalogStatusText(catalogSelectedBook.status) }}
                  </span>

                  <h3>{{ catalogSelectedBook.title }}</h3>
                  <p>{{ catalogSelectedBook.description || 'Chưa có mô tả cho sách này.' }}</p>

                  <div class="catalog-detail-grid">
                    <div>
                      <span>ISBN</span>
                      <b>{{ catalogSelectedBook.isbn }}</b>
                    </div>

                    <div>
                      <span>Tác giả</span>
                      <b>{{ catalogSelectedBook.author }}</b>
                    </div>

                    <div>
                      <span>NXB</span>
                      <b>{{ catalogSelectedBook.publisher }}</b>
                    </div>

                    <div>
                      <span>Năm XB</span>
                      <b>{{ catalogSelectedBook.year }}</b>
                    </div>

                    <div>
                      <span>Thể loại</span>
                      <b>{{ catalogSelectedBook.category }}</b>
                    </div>

                    <div>
                      <span>Bản sao</span>
                      <b>{{ catalogSelectedBook.availableCopies }} / {{ catalogSelectedBook.totalCopies }}</b>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </v-dialog>

          <!-- COPIES DIALOG -->
          <v-dialog v-model="catalogCopiesDialog" max-width="720">
            <v-card class="catalog-dialog-card">
              <div class="catalog-dialog-head">
                <div>
                  <h2>Quản lý bản sao</h2>
                  <p>{{ catalogSelectedBook?.title }}</p>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="catalogCopiesDialog = false" />
              </div>

              <div class="catalog-copy-grid">
                <div class="catalog-copy-panel">
                  <h3>Thêm bản sao</h3>
                  <p>Gọi API POST /api/books/{bookId}/copies</p>

                  <button type="button" class="catalog-save-btn" @click="catalogCreateCopy">
                    <v-icon size="19">mdi-plus</v-icon>
                    Thêm bản sao
                  </button>
                </div>

                <div class="catalog-copy-panel">
                  <h3>Thao tác copy cụ thể</h3>
                  <p>Nhập copyId để mượn, trả hoặc xóa bản sao.</p>

                  <input v-model.trim="catalogCopyForm.copyId" placeholder="Nhập copyId" />

                  <div class="catalog-copy-actions">
                    <button type="button" @click="catalogBorrowCopy">
                      <v-icon size="18">mdi-book-arrow-right-outline</v-icon>
                      Borrow
                    </button>

                    <button type="button" @click="catalogReturnCopy">
                      <v-icon size="18">mdi-book-arrow-left-outline</v-icon>
                      Return
                    </button>

                    <button type="button" class="danger" @click="catalogDeleteCopy">
                      <v-icon size="18">mdi-trash-can-outline</v-icon>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </v-card>
          </v-dialog>

          <v-snackbar
            v-model="catalogSnackbar.show"
            :color="catalogSnackbar.color"
            timeout="2800"
            location="top right"
          >
            {{ catalogSnackbar.text }}
          </v-snackbar>
        </div>


        <!-- ================= HỒ SƠ ĐỘC GIẢ ================= -->
        <div v-if="currentMenu === 'readers'">
          <!-- THỐNG KÊ HỒ SƠ ĐỘC GIẢ -->
          <v-row class="mb-3">
            <v-col
              v-for="stat in readerStats"
              :key="stat.title"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card class="reader-stat-card pa-4 rounded-xl border d-flex align-center" elevation="0">
                <v-avatar :color="stat.bg" size="58" class="mr-4 rounded-xl">
                  <v-icon :color="stat.color" size="30">{{ stat.icon }}</v-icon>
                </v-avatar>

                <div>
                  <div class="text-caption font-weight-bold text-grey-darken-1">
                    {{ stat.title }}
                  </div>

                  <div class="text-h5 font-weight-black text-grey-darken-4">
                    {{ stat.value }}
                  </div>

                  <div class="text-caption text-grey-darken-1">
                    {{ stat.note }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- BỘ LỌC -->
          <v-card class="pa-4 rounded-xl border mb-3" elevation="0">
            <v-row align="end">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="readerSearch"
                  label="Tìm kiếm"
                  placeholder="Nhập tên, email hoặc mã độc giả..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                  @update:model-value="readerPage = 1"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                  v-model="readerStatusFilter"
                  :items="readerStatusOptions"
                  item-title="title"
                  item-value="value"
                  label="Trạng thái"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                  @update:model-value="readerPage = 1"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-select
                  v-model="readerDepartmentFilter"
                  :items="readerDepartmentOptions"
                  item-title="title"
                  item-value="value"
                  label="Khoa / Lớp"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                  @update:model-value="readerPage = 1"
                />
              </v-col>

              <v-col cols="12" md="2" class="d-flex ga-2">
                <v-btn
                  block
                  variant="outlined"
                  color="grey-darken-2"
                  class="text-none font-weight-bold rounded-lg"
                  height="48"
                  @click="resetReaderFilter"
                >
                  <v-icon start size="18">mdi-filter-remove-outline</v-icon>
                  Bỏ lọc
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-row>
            <!-- BẢNG DANH SÁCH -->
            <v-col cols="12" lg="8">
              <v-card class="pa-4 rounded-xl border" elevation="0">
                <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-3">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-1">
                      Danh sách hồ sơ độc giả
                    </h3>

                    <div class="text-caption text-grey-darken-1">
                      Hiển thị {{ filteredReaders.length }} hồ sơ
                    </div>
                  </div>

                  <div class="d-flex ga-2 flex-wrap">
                    <v-btn
                      color="#0d9488"
                      class="text-white text-none font-weight-bold rounded-lg"
                      prepend-icon="mdi-plus"
                      @click="openAddReader"
                    >
                      Thêm độc giả
                    </v-btn>

                    <v-btn
                      variant="outlined"
                      color="#0d9488"
                      class="text-none font-weight-bold rounded-lg"
                      prepend-icon="mdi-download"
                      @click="exportReadersCsv"
                    >
                      Xuất Excel
                    </v-btn>
                  </div>
                </div>

                <div class="reader-table-wrapper">
                  <v-table density="comfortable" class="reader-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            :checked="isAllReadersSelected"
                            @change="toggleSelectReaderPage"
                          />
                        </th>
                        <th>Mã độc giả</th>
                        <th>Thông tin độc giả</th>
                        <th>SĐT</th>
                        <th>Khoa/Lớp</th>
                        <th>Mượn</th>
                        <th>Vi phạm</th>
                        <th>Trạng thái</th>
                        <th class="text-center">Thao tác</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="reader in paginatedReaders"
                        :key="reader.id"
                        :class="{ 'selected-reader-row': selectedReader?.id === reader.id }"
                        @click="selectReader(reader)"
                      >
                        <td @click.stop>
                          <input
                            v-model="selectedReaderIds"
                            type="checkbox"
                            :value="reader.id"
                          />
                        </td>

                        <td class="font-weight-black text-teal-darken-2">
                          {{ reader.id }}
                        </td>

                        <td>
                          <div class="d-flex align-center">
                            <v-avatar size="42" class="mr-3">
                              <v-img :src="reader.avatar" />
                            </v-avatar>

                            <div>
                              <div class="font-weight-bold text-grey-darken-4">
                                {{ reader.name }}
                              </div>
                              <div class="text-caption text-grey-darken-1">
                                {{ reader.email }}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>{{ reader.phone }}</td>
                        <td>{{ reader.department }}</td>
                        <td class="font-weight-bold">{{ reader.borrowing }}</td>
                        <td class="font-weight-bold">{{ reader.violations }}</td>

                        <td>
                          <v-chip
                            size="small"
                            class="font-weight-bold"
                            :color="readerStatusColor(reader.status).bg"
                            :text-color="readerStatusColor(reader.status).text"
                          >
                            {{ readerStatusText(reader.status) }}
                          </v-chip>
                        </td>

                        <td class="text-center" @click.stop>
                          <v-btn
                            icon="mdi-eye-outline"
                            size="small"
                            variant="text"
                            color="grey-darken-2"
                            @click="selectReader(reader)"
                          />

                          <v-btn
                            icon="mdi-pencil-outline"
                            size="small"
                            variant="text"
                            color="#0d9488"
                            @click="openEditReader(reader)"
                          />

                          <v-btn
                            :icon="reader.status === 'locked' ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                            size="small"
                            variant="text"
                            color="red"
                            @click="toggleReaderLock(reader)"
                          />
                        </td>
                      </tr>

                      <tr v-if="paginatedReaders.length === 0">
                        <td colspan="9" class="text-center text-grey py-8">
                          Không tìm thấy hồ sơ độc giả phù hợp.
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

                <!-- PHÂN TRANG -->
                <div class="d-flex justify-space-between align-center mt-4 flex-wrap ga-3">
                  <div class="text-caption text-grey-darken-1">
                    Trang {{ readerPage }} / {{ readerTotalPages }}
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap">
                    <v-select
                      v-model="readerPerPage"
                      :items="[5, 7, 10, 20]"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="width: 90px"
                    />

                    <v-btn
                      variant="outlined"
                      size="small"
                      :disabled="readerPage === 1"
                      @click="readerPage--"
                    >
                      Trước
                    </v-btn>

                    <v-btn
                      v-for="page in readerTotalPages"
                      :key="page"
                      size="small"
                      :color="page === readerPage ? '#0d9488' : 'grey'"
                      :variant="page === readerPage ? 'flat' : 'outlined'"
                      @click="readerPage = page"
                    >
                      {{ page }}
                    </v-btn>

                    <v-btn
                      variant="outlined"
                      size="small"
                      :disabled="readerPage === readerTotalPages"
                      @click="readerPage++"
                    >
                      Tiếp
                    </v-btn>
                  </div>
                </div>

                <!-- THANH THAO TÁC NHIỀU DÒNG -->
                <div v-if="selectedReaderIds.length > 0" class="bulk-reader-bar mt-4">
                  <span>Đã chọn {{ selectedReaderIds.length }} hồ sơ</span>

                  <div class="d-flex ga-2 flex-wrap">
                    <v-btn
                      size="small"
                      variant="outlined"
                      color="#0d9488"
                      class="text-none font-weight-bold"
                      @click="bulkActivateReaders"
                    >
                      Kích hoạt
                    </v-btn>

                    <v-btn
                      size="small"
                      variant="outlined"
                      color="orange"
                      class="text-none font-weight-bold"
                      @click="bulkLockReaders"
                    >
                      Khóa tài khoản
                    </v-btn>

                    <v-btn
                      size="small"
                      variant="outlined"
                      color="red"
                      class="text-none font-weight-bold"
                      @click="bulkDeleteReaders"
                    >
                      Xóa
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- CHI TIẾT HỒ SƠ -->
            <v-col cols="12" lg="4">
              <v-card
                v-if="selectedReader"
                class="pa-5 rounded-xl border detail-profile-card"
                elevation="0"
              >
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-subtitle-1 font-weight-bold mb-0">
                    Chi tiết hồ sơ
                  </h3>

                  <v-chip
                    size="small"
                    class="font-weight-bold"
                    :color="readerStatusColor(selectedReader.status).bg"
                    :text-color="readerStatusColor(selectedReader.status).text"
                  >
                    {{ readerStatusText(selectedReader.status) }}
                  </v-chip>
                </div>

                <div class="text-center mb-5">
                  <v-avatar size="92">
                    <v-img :src="selectedReader.avatar" />
                  </v-avatar>

                  <h2 class="text-h6 font-weight-black mt-3 mb-1">
                    {{ selectedReader.name }}
                  </h2>

                  <div class="text-caption text-grey-darken-1 font-weight-bold">
                    {{ selectedReader.id }}
                  </div>
                </div>

                <div class="profile-detail-list">
                  <div>
                    <span>Họ tên</span>
                    <strong>{{ selectedReader.name }}</strong>
                  </div>

                  <div>
                    <span>Mã độc giả</span>
                    <strong>{{ selectedReader.id }}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{{ selectedReader.email }}</strong>
                  </div>

                  <div>
                    <span>Số điện thoại</span>
                    <strong>{{ selectedReader.phone }}</strong>
                  </div>

                  <div>
                    <span>Khoa/Lớp</span>
                    <strong>{{ selectedReader.department }}</strong>
                  </div>

                  <div>
                    <span>Địa chỉ</span>
                    <strong>{{ selectedReader.address }}</strong>
                  </div>

                  <div>
                    <span>Ngày đăng ký</span>
                    <strong>{{ selectedReader.registeredAt }}</strong>
                  </div>

                  <div>
                    <span>Sách đang mượn</span>
                    <strong>{{ selectedReader.borrowing }}</strong>
                  </div>

                  <div>
                    <span>Số lần vi phạm</span>
                    <strong>{{ selectedReader.violations }}</strong>
                  </div>
                </div>

                <v-btn
                  block
                  variant="outlined"
                  color="#0d9488"
                  class="text-none font-weight-bold rounded-lg mt-5"
                  prepend-icon="mdi-history"
                  @click="openReaderHistory(selectedReader)"
                >
                  Xem lịch sử mượn trả
                </v-btn>

                <v-btn
                  block
                  variant="outlined"
                  color="red"
                  class="text-none font-weight-bold rounded-lg mt-3"
                  :prepend-icon="selectedReader.status === 'locked' ? 'mdi-lock-open-outline' : 'mdi-lock-outline'"
                  @click="toggleReaderLock(selectedReader)"
                >
                  {{ selectedReader.status === 'locked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản' }}
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

          <!-- FORM THÊM / SỬA ĐỘC GIẢ -->
          <v-dialog v-model="readerFormDialog" max-width="760">
            <v-card class="pa-6 rounded-xl">
              <div class="d-flex justify-space-between align-center mb-5">
                <h2 class="text-h6 font-weight-black">
                  {{ editingReader ? 'Chỉnh sửa hồ sơ độc giả' : 'Thêm độc giả mới' }}
                </h2>

                <v-btn icon="mdi-close" variant="text" @click="readerFormDialog = false" />
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="readerForm.name"
                    label="Họ và tên"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="readerForm.email"
                    label="Email"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="readerForm.phone"
                    label="Số điện thoại"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="readerForm.department"
                    label="Khoa/Lớp"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="readerForm.address"
                    label="Địa chỉ"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="readerForm.borrowing"
                    type="number"
                    label="Sách đang mượn"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="readerForm.violations"
                    type="number"
                    label="Số lần vi phạm"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="readerForm.status"
                    :items="readerStatusOptions.filter(x => x.value !== 'all')"
                    item-title="title"
                    item-value="value"
                    label="Trạng thái"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end ga-3 mt-3">
                <v-btn
                  variant="outlined"
                  color="grey"
                  class="text-none font-weight-bold"
                  @click="readerFormDialog = false"
                >
                  Hủy
                </v-btn>

                <v-btn
                  color="#0d9488"
                  class="text-white text-none font-weight-bold"
                  prepend-icon="mdi-content-save-outline"
                  @click="saveReader"
                >
                  Lưu hồ sơ
                </v-btn>
              </div>
            </v-card>
          </v-dialog>

          <!-- LỊCH SỬ MƯỢN TRẢ -->
          <v-dialog v-model="readerHistoryDialog" max-width="760">
            <v-card class="pa-6 rounded-xl">
              <div class="d-flex justify-space-between align-center mb-5">
                <h2 class="text-h6 font-weight-black">
                  Lịch sử mượn trả - {{ historyReader?.name }}
                </h2>

                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="readerHistoryDialog = false"
                />
              </div>

              <v-table density="comfortable" class="reader-table">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in readerBorrowHistory" :key="item.book">
                    <td class="font-weight-bold">{{ item.book }}</td>
                    <td>{{ item.borrowedAt }}</td>
                    <td>{{ item.returnedAt }}</td>
                    <td>
                      <v-chip
                        size="small"
                        class="font-weight-bold"
                        :color="item.status === 'late' ? 'red-lighten-5' : 'green-lighten-5'"
                        :text-color="item.status === 'late' ? 'red-darken-2' : 'green-darken-2'"
                      >
                        {{ item.statusText }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-dialog>
        </div>

        <!-- ================= THẺ THƯ VIỆN - BẢN SẠCH, RÕ CHỮ ================= -->
        <div v-if="currentMenu === 'cards'" class="library-cards-page">
          <v-row class="mb-3" dense>
            <!-- PREVIEW CARD -->
            <v-col cols="12" lg="5">
              <v-card class="card-preview-panel pa-4 rounded-xl border" elevation="0">
                <div class="section-title-row mb-3">
                  <h3>Xem trước thẻ thư viện</h3>
                  <span v-if="selectedLibraryCard" class="status-pill" :class="`status-${selectedLibraryCard.status}`">
                    {{ cardStatusText(selectedLibraryCard.status) }}
                  </span>
                </div>

                <div v-if="selectedLibraryCard" class="library-id-card">
                  <div class="card-wave wave-1"></div>
                  <div class="card-wave wave-2"></div>

                  <div class="id-card-head">
                    <div class="id-logo">
                      <v-icon color="#0d9488" size="28">mdi-book-open-page-variant</v-icon>
                    </div>

                    <div>
                      <strong>LIBRARY SYSTEM</strong>
                      <p>Thẻ thư viện</p>
                    </div>
                  </div>

                  <div class="id-card-body">
                    <img :src="selectedLibraryCard.avatar" :alt="selectedLibraryCard.owner" class="card-avatar" />

                    <div class="card-owner-info">
                      <h2>{{ selectedLibraryCard.id }}</h2>
                      <h4>{{ selectedLibraryCard.owner }}</h4>

                      <div class="card-meta">
                        <span>
                          <v-icon size="15">mdi-card-account-details-outline</v-icon>
                          {{ selectedLibraryCard.type }}
                        </span>
                        <span>
                          <v-icon size="15">mdi-domain</v-icon>
                          {{ selectedLibraryCard.department }}
                        </span>
                      </div>

                      <div class="date-row">
                        <div>
                          <small>Ngày cấp</small>
                          <b>{{ selectedLibraryCard.issueDate }}</b>
                        </div>

                        <div>
                          <small>Hết hạn</small>
                          <b>{{ selectedLibraryCard.expiryDate }}</b>
                        </div>
                      </div>
                    </div>

                    <div class="qr-code">
                      <span v-for="n in 49" :key="n" :class="{ filled: qrFill(n, selectedLibraryCard.id) }"></span>
                    </div>
                  </div>

                  <div class="id-card-foot">
                    <span class="status-pill light" :class="`status-${selectedLibraryCard.status}`">
                      {{ cardStatusText(selectedLibraryCard.status) }}
                    </span>

                    <div>
                      <div class="barcode">
                        <i v-for="n in 32" :key="n" :style="{ height: `${18 + (n % 5) * 4}px` }"></i>
                      </div>
                      <small>{{ selectedLibraryCard.id }}</small>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- QUICK ACTIONS + STATS -->
            <v-col cols="12" lg="7">
              <v-card class="pa-4 rounded-xl border h-100" elevation="0">
                <div class="section-title-row mb-3">
                  <h3>Thao tác nhanh</h3>
                </div>

                <div class="quick-card-actions">
                  <button
                    v-for="action in cardQuickActions"
                    :key="action.title"
                    class="quick-card-btn"
                    type="button"
                    :style="{ color: action.color }"
                    @click="action.handler"
                  >
                    <v-icon size="31">{{ action.icon }}</v-icon>
                    <span>{{ action.title }}</span>
                  </button>
                </div>

                <v-divider class="my-4" />

                <div class="section-title-row mb-3">
                  <h3>Thống kê thẻ</h3>
                </div>

                <div class="library-card-stats">
                  <div v-for="stat in libraryCardStats" :key="stat.title" class="card-stat-box">
                    <div class="stat-mini-icon" :style="{ color: stat.color }">
                      <v-icon size="26">{{ stat.icon }}</v-icon>
                    </div>
                    <p>{{ stat.title }}</p>
                    <h2>{{ stat.value }}</h2>
                    <span>{{ stat.note }}</span>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- FILTER -->
          <v-card class="pa-4 rounded-xl border mb-3" elevation="0">
            <v-row dense align="end">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="cardSearch"
                  placeholder="Nhập mã thẻ, tên độc giả hoặc email..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-select
                  v-model="cardStatusFilter"
                  :items="cardStatusOptions"
                  item-title="title"
                  item-value="value"
                  label="Trạng thái"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-select
                  v-model="cardTypeFilter"
                  :items="cardTypeOptions"
                  item-title="title"
                  item-value="value"
                  label="Loại thẻ"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-select
                  v-model="cardDepartmentFilter"
                  :items="cardDepartmentOptions"
                  item-title="title"
                  item-value="value"
                  label="Khoa / Đơn vị"
                  variant="outlined"
                  density="comfortable"
                  color="#0d9488"
                  hide-details
                />
              </v-col>

              <v-col cols="12" md="2">
                <v-btn
                  block
                  variant="outlined"
                  height="48"
                  class="text-none font-weight-bold rounded-lg"
                  color="grey-darken-3"
                  prepend-icon="mdi-filter-remove-outline"
                  @click="resetCardFilter"
                >
                  Bỏ lọc
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <!-- TABLE -->
          <v-card class="pa-4 rounded-xl border" elevation="0">
            <div class="section-title-row mb-3">
              <div>
                <h3>Danh sách thẻ thư viện</h3>
                <p>Hiển thị {{ filteredLibraryCards.length }} thẻ</p>
              </div>

              <div class="top-actions">
                <v-btn
                  color="#0d9488"
                  class="text-white text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-plus"
                  @click="openAddCard"
                >
                  Cấp thẻ mới
                </v-btn>

                <v-btn
                  variant="outlined"
                  color="#0d9488"
                  class="text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-download"
                  @click="exportCardsCsv"
                >
                  Xuất Excel
                </v-btn>
              </div>
            </div>

            <div class="library-table-wrap">
              <table class="library-card-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" :checked="isAllCardsSelected" @change="toggleSelectCardPage" />
                    </th>
                    <th>Mã thẻ</th>
                    <th>Chủ thẻ</th>
                    <th>Loại thẻ</th>
                    <th>Ngày cấp</th>
                    <th>Ngày hết hạn</th>
                    <th>QR / Barcode</th>
                    <th>Trạng thái</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="card in paginatedLibraryCards"
                    :key="card.id"
                    :class="{ selected: selectedLibraryCard?.id === card.id }"
                    @click="selectLibraryCard(card)"
                  >
                    <td @click.stop>
                      <input type="checkbox" :value="card.id" v-model="selectedCardIds" />
                    </td>

                    <td class="card-id-cell">{{ card.id }}</td>

                    <td>
                      <div class="owner-cell">
                        <v-avatar size="42">
                          <v-img :src="card.avatar" />
                        </v-avatar>

                        <div>
                          <strong>{{ card.owner }}</strong>
                          <span>{{ card.email }}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span class="type-pill" :class="`type-${card.type.replaceAll(' ', '-').toLowerCase()}`">
                        {{ card.type }}
                      </span>
                    </td>

                    <td>{{ card.issueDate }}</td>

                    <td>
                      <span :class="{ 'date-danger': card.status === 'expired', 'date-warning': card.status === 'expiring' }">
                        {{ card.expiryDate }}
                        <v-icon v-if="card.status === 'expired' || card.status === 'expiring'" size="15" class="ml-1">
                          mdi-alert-circle
                        </v-icon>
                      </span>
                    </td>

                    <td>
                      <button class="mini-qr" type="button" @click.stop="selectLibraryCard(card)">
                        <span v-for="n in 25" :key="n" :class="{ filled: qrFill(n, card.id) }"></span>
                      </button>
                    </td>

                    <td>
                      <span class="status-pill" :class="`status-${card.status}`">
                        {{ cardStatusText(card.status) }}
                      </span>
                    </td>

                    <td class="text-center" @click.stop>
                      <div class="table-card-actions">
                        <button title="Gia hạn" @click="openRenewCard(card)">
                          <v-icon size="18">mdi-refresh</v-icon>
                        </button>

                        <button title="In thẻ" @click="printCard(card)">
                          <v-icon size="18">mdi-printer-outline</v-icon>
                        </button>

                        <button title="Khóa / mở khóa" class="orange" @click="toggleCardLock(card)">
                          <v-icon size="18">
                            {{ card.status === 'locked' ? 'mdi-lock-open-outline' : 'mdi-lock-outline' }}
                          </v-icon>
                        </button>

                        <button title="Sửa" @click="openEditCard(card)">
                          <v-icon size="18">mdi-pencil-outline</v-icon>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="paginatedLibraryCards.length === 0">
                    <td colspan="9" class="empty-table-text">Không tìm thấy thẻ phù hợp.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="card-pagination">
              <div class="d-flex align-center ga-3">
                <v-select
                  v-model="cardPerPage"
                  :items="[5, 7, 10, 20]"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 90px"
                />
                <span>thẻ mỗi trang</span>
              </div>

              <div class="d-flex align-center ga-2">
                <v-btn size="small" variant="outlined" :disabled="cardPage === 1" @click="cardPage--">
                  Trước
                </v-btn>

                <v-btn
                  v-for="page in cardTotalPages"
                  :key="page"
                  size="small"
                  :color="page === cardPage ? '#0d9488' : 'grey'"
                  :variant="page === cardPage ? 'flat' : 'outlined'"
                  @click="cardPage = page"
                >
                  {{ page }}
                </v-btn>

                <v-btn size="small" variant="outlined" :disabled="cardPage === cardTotalPages" @click="cardPage++">
                  Tiếp
                </v-btn>
              </div>
            </div>

            <div v-if="selectedCardIds.length > 0" class="card-bulk-bar">
              <span>Đã chọn {{ selectedCardIds.length }} thẻ</span>

              <div class="d-flex ga-2">
                <v-btn size="small" variant="outlined" color="#0d9488" @click="bulkActivateCards">Kích hoạt</v-btn>
                <v-btn size="small" variant="outlined" color="orange" @click="bulkLockCards">Khóa thẻ</v-btn>
                <v-btn size="small" variant="outlined" color="purple" @click="bulkPrintCards">In thẻ</v-btn>
                <v-btn size="small" variant="outlined" color="red" @click="bulkDeleteCards">Xóa</v-btn>
              </div>
            </div>
          </v-card>

          <!-- ADD / EDIT DIALOG -->
          <v-dialog v-model="cardFormDialog" max-width="760">
            <v-card class="pa-6 rounded-xl">
              <div class="section-title-row mb-5">
                <h3>{{ editingCard ? 'Chỉnh sửa thẻ thư viện' : 'Cấp thẻ thư viện mới' }}</h3>
                <v-btn icon="mdi-close" variant="text" @click="cardFormDialog = false" />
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="cardForm.owner" label="Chủ thẻ" variant="outlined" color="#0d9488" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="cardForm.email" label="Email" variant="outlined" color="#0d9488" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="cardForm.department" label="Khoa/Lớp" variant="outlined" color="#0d9488" />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="cardForm.type"
                    :items="cardTypeOptions.filter(item => item.value !== 'all')"
                    item-title="title"
                    item-value="value"
                    label="Loại thẻ"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="cardForm.issueDate" label="Ngày cấp" variant="outlined" color="#0d9488" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field v-model="cardForm.expiryDate" label="Ngày hết hạn" variant="outlined" color="#0d9488" />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="cardForm.status"
                    :items="cardStatusOptions.filter(item => item.value !== 'all')"
                    item-title="title"
                    item-value="value"
                    label="Trạng thái"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>
              </v-row>

              <div class="d-flex justify-end ga-3 mt-2">
                <v-btn variant="outlined" color="grey" class="text-none font-weight-bold" @click="cardFormDialog = false">
                  Hủy
                </v-btn>

                <v-btn color="#0d9488" class="text-white text-none font-weight-bold" prepend-icon="mdi-content-save-outline" @click="saveLibraryCard">
                  Lưu thẻ
                </v-btn>
              </div>
            </v-card>
          </v-dialog>

          <!-- RENEW DIALOG -->
          <v-dialog v-model="renewCardDialog" max-width="480">
            <v-card class="pa-6 rounded-xl">
              <div class="section-title-row mb-4">
                <h3>Gia hạn thẻ</h3>
                <v-btn icon="mdi-close" variant="text" @click="renewCardDialog = false" />
              </div>

              <p class="text-grey-darken-1 mb-4">
                Thẻ: <b>{{ selectedLibraryCard?.id }}</b> - {{ selectedLibraryCard?.owner }}
              </p>

              <v-select
                v-model="renewMonths"
                :items="[3, 6, 12, 24]"
                label="Gia hạn thêm"
                suffix="tháng"
                variant="outlined"
                color="#0d9488"
              />

              <div class="d-flex justify-end ga-3 mt-2">
                <v-btn variant="outlined" color="grey" class="text-none font-weight-bold" @click="renewCardDialog = false">
                  Hủy
                </v-btn>

                <v-btn color="#0d9488" class="text-white text-none font-weight-bold" @click="renewSelectedCard">
                  Gia hạn
                </v-btn>
              </div>
            </v-card>
          </v-dialog>
        </div>

        <!-- ================= HỒ SƠ MƯỢN TRẢ - CIRCULATION SERVICE NHÓM 2 FULL ================= -->
        <div v-if="currentMenu === 'history'" class="circulation-page circulation-full-page">
          <!-- HERO NHÓM 2 -->
          <section class="circulation-hero-full">
            <div>
              <span class="circulation-hero-chip">
                <v-icon size="18">mdi-swap-horizontal-circle-outline</v-icon>
                Circulation Service - Nhóm 2
              </span>

              <h1>Quản lý mượn trả thư viện</h1>

              <p>
                Tạo phiếu mượn, kiểm tra giới hạn độc giả, xử lý trả sách,
                tự động tính phí quá hạn, quản lý công nợ và phát sự kiện
                <b>book.borrowed</b> / <b>book.returned</b>.
              </p>

              <div class="circulation-hero-actions">
                <button type="button" class="hero-create-borrow" @click="setCirculationTab('create')">
                  <v-icon size="21">mdi-plus</v-icon>
                  Tạo phiếu mượn
                </button>

                <button type="button" class="hero-refresh-borrow" @click="loadCirculationRecords">
                  <v-icon size="21">mdi-refresh</v-icon>
                  Làm mới API
                </button>
              </div>
            </div>

            <div class="circulation-hero-visual">
              <div class="circulation-books-stack">
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div class="circulation-card-mini">
                <v-icon size="38">mdi-book-sync-outline</v-icon>
                <strong>{{ circulationStats.total }}</strong>
                <span>Hồ sơ</span>
              </div>
            </div>
          </section>

          <!-- KPI -->
          <section class="circulation-kpi-grid enhanced">
            <article class="circulation-kpi-card">
              <span class="icon mint">
                <v-icon size="32">mdi-file-document-outline</v-icon>
              </span>
              <div>
                <p>Tổng phiếu</p>
                <h2>{{ circulationStats.total }}</h2>
                <small>Tất cả phiếu phát sinh</small>
              </div>
            </article>

            <article class="circulation-kpi-card">
              <span class="icon yellow">
                <v-icon size="32">mdi-timer-sand</v-icon>
              </span>
              <div>
                <p>Chờ duyệt</p>
                <h2>{{ pendingBorrowRecords.length }}</h2>
                <small>Cần thủ thư xác nhận</small>
              </div>
            </article>

            <article class="circulation-kpi-card">
              <span class="icon blue">
                <v-icon size="32">mdi-book-open-page-variant</v-icon>
              </span>
              <div>
                <p>Đang mượn</p>
                <h2>{{ activeBorrowRecords.length }}</h2>
                <small>Chưa hoàn trả sách</small>
              </div>
            </article>

            <article class="circulation-kpi-card">
              <span class="icon green">
                <v-icon size="32">mdi-check-circle-outline</v-icon>
              </span>
              <div>
                <p>Đã trả</p>
                <h2>{{ returnedBorrowRecords.length }}</h2>
                <small>Hoàn tất mượn trả</small>
              </div>
            </article>

            <article class="circulation-kpi-card">
              <span class="icon orange">
                <v-icon size="32">mdi-alert-circle-outline</v-icon>
              </span>
              <div>
                <p>Quá hạn</p>
                <h2>{{ overdueBorrowRecords.length }}</h2>
                <small>Cần xử lý nhắc trả</small>
              </div>
            </article>

            <article class="circulation-kpi-card">
              <span class="icon red">
                <v-icon size="32">mdi-cash-multiple</v-icon>
              </span>
              <div>
                <p>Công nợ</p>
                <h2>{{ formatMoney(circulationStats.debt) }}</h2>
                <small>Tiền phạt chưa thanh toán</small>
              </div>
            </article>
          </section>

          <!-- TAB MENU -->
          <section class="circulation-tabs-card">
            <button
              v-for="tab in circulationTabItems"
              :key="tab.value"
              type="button"
              :class="{ active: circulationActiveTab === tab.value }"
              @click="setCirculationTab(tab.value)"
            >
              <v-icon size="20">{{ tab.icon }}</v-icon>
              {{ tab.title }}
              <span>{{ tab.count }}</span>
            </button>
          </section>

          <!-- TAB: TẤT CẢ PHIẾU -->
          <div v-if="circulationActiveTab === 'records'" class="circulation-tab-panel">
            <section class="circulation-toolbar-card">
              <div class="circulation-search">
                <v-icon size="23">mdi-magnify</v-icon>
                <input
                  v-model="circulationFilters.keyword"
                  placeholder="Tìm theo độc giả, tài liệu, mã phiếu..."
                />
                <button v-if="circulationFilters.keyword" type="button" @click="circulationFilters.keyword = ''">
                  <v-icon size="18">mdi-close</v-icon>
                </button>
              </div>

              <select v-model="circulationFilters.status">
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="borrowing">Đang mượn</option>
                <option value="returned">Đã trả</option>
                <option value="overdue">Quá hạn</option>
              </select>

              <select v-model="circulationFilters.time">
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">Tháng này</option>
              </select>

              <button type="button" class="circulation-refresh-btn" @click="loadCirculationRecords">
                <v-icon size="21">mdi-refresh</v-icon>
                Làm mới
              </button>

              <button type="button" class="circulation-create-btn" @click="setCirculationTab('create')">
                <v-icon size="21">mdi-plus</v-icon>
                Tạo phiếu
              </button>
            </section>

            <section class="circulation-table-card full-width-table">
              <div class="circulation-card-head">
                <div>
                  <h3>Tất cả hồ sơ mượn trả</h3>
                  <p>Hiển thị {{ filteredCirculationRecords.length }} hồ sơ</p>
                </div>

                <div class="circulation-head-actions">
                  <button type="button" @click="exportCirculationCsv">
                    <v-icon size="18">mdi-download-outline</v-icon>
                    Xuất CSV
                  </button>
                </div>
              </div>

              <div v-if="circulationLoading" class="circulation-state">
                <v-progress-circular indeterminate color="#0d9488" size="46" />
                <h3>Đang tải dữ liệu mượn trả...</h3>
              </div>

              <div v-else-if="filteredCirculationRecords.length === 0" class="circulation-state">
                <v-icon size="64" color="#94a3b8">mdi-file-search-outline</v-icon>
                <h3>Chưa có dữ liệu mượn trả</h3>
                <p>Dữ liệu lấy từ API nhóm 2 hoặc localStorage phát sinh khi người dùng đặt mượn.</p>
              </div>

              <div v-else class="circulation-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phiếu</th>
                      <th>Độc giả</th>
                      <th>Tên tài liệu</th>
                      <th>Ngày mượn</th>
                      <th>Hạn trả</th>
                      <th>Ngày trả thực tế</th>
                      <th>Quá hạn</th>
                      <th>Phạt</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="record in paginatedCirculationRecords" :key="record.id">
                      <td class="borrow-code">{{ record.borrowId }}</td>

                      <td>
                        <strong>{{ record.readerName }}</strong>
                        <small>{{ record.readerId }}</small>
                      </td>

                      <td>
                        <strong>{{ record.bookTitle }}</strong>
                        <small>{{ record.isbn || record.bookId }}</small>
                      </td>

                      <td>{{ record.borrowDate || '--' }}</td>
                      <td>{{ record.dueDate || '--' }}</td>

                      <td>
                        <span v-if="record.returnDate">{{ record.returnDate }}</span>
                        <span v-else class="mini-chip green">
                          <v-icon size="14">mdi-calendar-clock</v-icon>
                          Chưa trả
                        </span>
                      </td>

                      <td>
                        <span :class="record.overdueDays > 0 ? 'text-red font-weight-bold' : 'text-grey-darken-2'">
                          {{ record.overdueDays }} ngày
                        </span>
                      </td>

                      <td class="fine-cell">
                        {{ formatMoney(record.fineAmount) }}
                        <span v-if="record.fineAmount > 0" :class="record.finePaid ? 'paid' : 'unpaid'">
                          {{ record.finePaid ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                        </span>
                      </td>

                      <td>
                        <span class="borrow-status" :class="record.status">
                          {{ borrowStatusText(record.status) }}
                        </span>
                      </td>

                      <td>
                        <div class="circulation-row-actions">
                          <button type="button" title="Xem chi tiết" @click="openBorrowDetail(record)">
                            <v-icon size="18">mdi-eye-outline</v-icon>
                          </button>

                          <button
                            v-if="record.status === 'pending'"
                            type="button"
                            title="Duyệt phiếu mượn"
                            @click="approveBorrow(record)"
                          >
                            <v-icon size="18">mdi-check-circle-outline</v-icon>
                          </button>

                          <button
                            v-if="record.status === 'borrowing' || record.status === 'overdue'"
                            type="button"
                            title="Xử lý trả sách"
                            @click="openReturnDialog(record)"
                          >
                            <v-icon size="18">mdi-keyboard-return</v-icon>
                          </button>

                          <button
                            v-if="record.fineAmount > 0 && !record.finePaid"
                            type="button"
                            class="money"
                            title="Thanh toán phạt"
                            @click="payFine(record)"
                          >
                            <v-icon size="18">mdi-cash-check</v-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="filteredCirculationRecords.length > 0" class="circulation-pagination">
                <span>
                  Hiển thị {{ circulationStartIndex + 1 }}-{{ circulationEndIndex }}
                  trên {{ filteredCirculationRecords.length }} hồ sơ
                </span>

                <div>
                  <button type="button" :disabled="circulationPage === 1" @click="circulationPage--">
                    <v-icon size="18">mdi-chevron-left</v-icon>
                  </button>

                  <button
                    v-for="page in circulationTotalPages"
                    :key="page"
                    type="button"
                    :class="{ active: page === circulationPage }"
                    @click="circulationPage = page"
                  >
                    {{ page }}
                  </button>

                  <button
                    type="button"
                    :disabled="circulationPage === circulationTotalPages"
                    @click="circulationPage++"
                  >
                    <v-icon size="18">mdi-chevron-right</v-icon>
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- TAB: TẠO PHIẾU MƯỢN -->
          <div v-if="circulationActiveTab === 'create'" class="circulation-tab-panel">
            <section class="circulation-create-grid">
              <div class="circulation-form-card">
                <div class="circulation-card-head">
                  <div>
                    <h3>Tạo phiếu mượn mới</h3>
                    <p>Chọn độc giả, chọn sách và kiểm tra giới hạn trước khi tạo phiếu.</p>
                  </div>
                </div>

                <div class="borrow-form-grid inline">
                  <label>
                    Độc giả
                    <select v-model="borrowForm.readerId" @change="fillBorrowReader">
                      <option value="">Chọn độc giả</option>
                      <option v-for="reader in circulationReaders" :key="reader.id" :value="reader.id">
                        {{ reader.name }} - {{ reader.id }}
                      </option>
                    </select>
                  </label>

                  <label>
                    Tên độc giả
                    <input v-model.trim="borrowForm.readerName" placeholder="Tên độc giả" />
                  </label>

                  <label>
                    Email độc giả
                    <input v-model.trim="borrowForm.readerEmail" placeholder="Email" />
                  </label>

                  <label>
                    Sách
                    <select v-model="borrowForm.bookId" @change="fillBorrowBook">
                      <option value="">Chọn sách</option>
                      <option v-for="book in circulationBooks" :key="book.id" :value="book.id">
                        {{ book.title }} - Còn {{ book.availableCopies }}
                      </option>
                    </select>
                  </label>

                  <label>
                    Tên tài liệu
                    <input v-model.trim="borrowForm.bookTitle" placeholder="Tên sách" />
                  </label>

                  <label>
                    ISBN
                    <input v-model.trim="borrowForm.isbn" placeholder="ISBN" />
                  </label>

                  <label>
                    Ngày mượn
                    <input v-model="borrowForm.borrowDate" type="date" />
                  </label>

                  <label>
                    Hạn trả
                    <input v-model="borrowForm.dueDate" type="date" />
                  </label>
                </div>

                <div class="borrow-limit-box" :class="{ danger: !borrowLimitCheck.allowed }">
                  <v-icon size="24">
                    {{ borrowLimitCheck.allowed ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
                  </v-icon>

                  <div>
                    <b>{{ borrowLimitCheck.message }}</b>
                    <p>Đang mượn: {{ borrowLimitCheck.current }} / {{ borrowLimitCheck.limit }} sách</p>
                  </div>
                </div>

                <div class="dialog-action-row">
                  <button type="button" class="cancel-btn" @click="setCirculationTab('records')">Quay lại</button>

                  <button
                    type="button"
                    class="save-btn"
                    :disabled="!borrowLimitCheck.allowed"
                    @click="createBorrowRecord"
                  >
                    <v-icon size="19">mdi-content-save-outline</v-icon>
                    Tạo phiếu mượn
                  </button>
                </div>
              </div>

              <aside class="circulation-guide-card">
                <h3>Quy tắc mượn sách</h3>

                <div class="guide-item">
                  <v-icon size="22">mdi-account-check-outline</v-icon>
                  <span>Mỗi độc giả được mượn tối đa {{ maxBorrowLimit }} sách đang hoạt động.</span>
                </div>

                <div class="guide-item">
                  <v-icon size="22">mdi-book-check-outline</v-icon>
                  <span>Chỉ tạo phiếu khi sách còn bản sao có thể mượn.</span>
                </div>

                <div class="guide-item">
                  <v-icon size="22">mdi-broadcast</v-icon>
                  <span>Khi tạo/duyệt phiếu sẽ publish event <b>book.borrowed</b>.</span>
                </div>

                <div class="guide-item">
                  <v-icon size="22">mdi-cash-clock</v-icon>
                  <span>Trả quá hạn sẽ tự tính phạt {{ formatMoney(finePerDay) }} / ngày.</span>
                </div>
              </aside>
            </section>
          </div>

          <!-- TAB: ĐANG MƯỢN -->
          <div v-if="circulationActiveTab === 'active'" class="circulation-tab-panel">
            <section class="circulation-status-board">
              <div class="board-head">
                <h3>Phiếu đang mượn</h3>
                <p>{{ activeBorrowRecords.length }} phiếu chưa trả</p>
              </div>

              <div v-if="activeBorrowRecords.length === 0" class="circulation-state compact">
                <v-icon size="54" color="#94a3b8">mdi-book-check-outline</v-icon>
                <h3>Không có phiếu đang mượn</h3>
              </div>

              <div v-else class="borrow-card-grid">
                <article
                  v-for="record in activeBorrowRecords"
                  :key="record.id"
                  class="borrow-mini-card"
                  :class="{ overdue: record.status === 'overdue' }"
                >
                  <div class="borrow-mini-top">
                    <span class="borrow-status" :class="record.status">{{ borrowStatusText(record.status) }}</span>
                    <b>{{ record.borrowId }}</b>
                  </div>

                  <h4>{{ record.bookTitle }}</h4>
                  <p>{{ record.readerName }} - {{ record.readerId }}</p>

                  <div class="borrow-mini-info">
                    <span>Ngày mượn: <b>{{ record.borrowDate }}</b></span>
                    <span>Hạn trả: <b>{{ record.dueDate || '--' }}</b></span>
                    <span>Quá hạn: <b>{{ record.overdueDays }} ngày</b></span>
                  </div>

                  <button type="button" @click="openReturnDialog(record)">
                    <v-icon size="18">mdi-keyboard-return</v-icon>
                    Xử lý trả sách
                  </button>
                </article>
              </div>
            </section>
          </div>

          <!-- TAB: SÁCH QUÁ HẠN -->
          <div v-if="circulationActiveTab === 'overdue'" class="circulation-tab-panel">
            <section class="circulation-table-card full-width-table">
              <div class="circulation-card-head">
                <div>
                  <h3>Danh sách sách quá hạn</h3>
                  <p>{{ overdueBorrowRecords.length }} hồ sơ quá hạn</p>
                </div>
              </div>

              <div v-if="overdueBorrowRecords.length === 0" class="circulation-state">
                <v-icon size="64" color="#10b981">mdi-check-circle-outline</v-icon>
                <h3>Không có sách quá hạn</h3>
                <p>Tất cả phiếu mượn hiện đang đúng hạn hoặc đã hoàn trả.</p>
              </div>

              <div v-else class="circulation-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Độc giả</th>
                      <th>Tài liệu</th>
                      <th>Hạn trả</th>
                      <th>Số ngày trễ</th>
                      <th>Phạt dự kiến</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="record in overdueBorrowRecords" :key="record.id">
                      <td>
                        <strong>{{ record.readerName }}</strong>
                        <small>{{ record.readerId }}</small>
                      </td>

                      <td>
                        <strong>{{ record.bookTitle }}</strong>
                        <small>{{ record.isbn || record.bookId }}</small>
                      </td>

                      <td>{{ record.dueDate || '--' }}</td>
                      <td class="text-red font-weight-bold">{{ record.overdueDays }} ngày</td>
                      <td class="fine-cell">{{ formatMoney(record.fineAmount) }}</td>

                      <td>
                        <div class="circulation-row-actions">
                          <button type="button" @click="openBorrowDetail(record)">
                            <v-icon size="18">mdi-eye-outline</v-icon>
                          </button>

                          <button type="button" @click="openReturnDialog(record)">
                            <v-icon size="18">mdi-keyboard-return</v-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <!-- TAB: PHÍ PHẠT / CÔNG NỢ -->
          <div v-if="circulationActiveTab === 'fines'" class="circulation-tab-panel">
            <section class="fine-dashboard-grid">
              <div class="fine-summary-card">
                <h3>Tổng quan phí phạt</h3>

                <div class="fine-big-number">
                  {{ formatMoney(circulationStats.debt) }}
                </div>

                <p>Tổng công nợ chưa thanh toán của độc giả</p>

                <div class="fine-summary-row">
                  <span>Hồ sơ có công nợ</span>
                  <b>{{ debtBorrowRecords.length }}</b>
                </div>

                <div class="fine-summary-row">
                  <span>Đã thanh toán</span>
                  <b>{{ circulationRecords.filter(item => item.fineAmount > 0 && item.finePaid).length }}</b>
                </div>
              </div>

              <div class="fine-list-card">
                <div class="circulation-card-head">
                  <div>
                    <h3>Danh sách công nợ phí phạt</h3>
                    <p>Quản lý thanh toán phí quá hạn</p>
                  </div>
                </div>

                <div v-if="debtBorrowRecords.length === 0" class="circulation-state compact">
                  <v-icon size="58" color="#10b981">mdi-cash-check</v-icon>
                  <h3>Không có công nợ phí phạt</h3>
                </div>

                <div v-else class="debt-table-list">
                  <div v-for="record in debtBorrowRecords" :key="record.id">
                    <div>
                      <b>{{ record.readerName }}</b>
                      <p>{{ record.bookTitle }}</p>
                      <small>Trễ {{ record.overdueDays }} ngày</small>
                    </div>

                    <strong>{{ formatMoney(record.fineAmount) }}</strong>

                    <button type="button" @click="payFine(record)">
                      <v-icon size="18">mdi-cash-check</v-icon>
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- TAB: EVENTS -->
          <div v-if="circulationActiveTab === 'events'" class="circulation-tab-panel">
            <section class="circulation-table-card full-width-table">
              <div class="circulation-card-head">
                <div>
                  <h3>Lịch sử event mượn trả</h3>
                  <p>book.borrowed / book.returned để nhóm 3 tổng hợp báo cáo</p>
                </div>
              </div>

              <div v-if="circulationEvents.length === 0" class="circulation-state">
                <v-icon size="64" color="#94a3b8">mdi-broadcast-off</v-icon>
                <h3>Chưa có event nào</h3>
                <p>Event sẽ xuất hiện khi tạo phiếu mượn hoặc xử lý trả sách.</p>
              </div>

              <div v-else class="event-timeline">
                <div v-for="event in circulationEvents" :key="event.id" class="event-timeline-item">
                  <span>
                    <v-icon size="20">mdi-broadcast</v-icon>
                  </span>

                  <div>
                    <b>{{ event.type }}</b>
                    <p>{{ event.message }}</p>
                    <small>{{ formatDateTime(event.createdAt) }}</small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- RETURN DIALOG -->
          <v-dialog v-model="returnDialog" max-width="620">
            <v-card class="circulation-dialog-card">
              <div class="dialog-head-row">
                <div>
                  <h2>Xử lý trả sách</h2>
                  <p>{{ selectedBorrowRecord?.bookTitle }}</p>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="returnDialog = false" />
              </div>

              <div class="return-summary">
                <div>
                  <span>Độc giả</span>
                  <b>{{ selectedBorrowRecord?.readerName }}</b>
                </div>

                <div>
                  <span>Ngày mượn</span>
                  <b>{{ selectedBorrowRecord?.borrowDate }}</b>
                </div>

                <div>
                  <span>Hạn trả</span>
                  <b>{{ selectedBorrowRecord?.dueDate }}</b>
                </div>

                <div>
                  <span>Ngày trả thực tế</span>
                  <input v-model="returnForm.returnDate" type="date" />
                </div>

                <div>
                  <span>Số ngày quá hạn</span>
                  <b class="text-red">{{ returnFinePreview.overdueDays }} ngày</b>
                </div>

                <div>
                  <span>Tiền phạt tự động</span>
                  <b class="text-red">{{ formatMoney(returnFinePreview.fineAmount) }}</b>
                </div>
              </div>

              <div class="dialog-action-row">
                <button type="button" class="cancel-btn" @click="returnDialog = false">Hủy</button>

                <button type="button" class="save-btn" @click="returnBorrowRecord">
                  <v-icon size="19">mdi-keyboard-return</v-icon>
                  Xác nhận trả sách
                </button>
              </div>
            </v-card>
          </v-dialog>

          <!-- DETAIL DIALOG -->
          <v-dialog v-model="borrowDetailDialog" max-width="720">
            <v-card class="circulation-dialog-card">
              <div class="dialog-head-row">
                <div>
                  <h2>Chi tiết phiếu mượn</h2>
                  <p>{{ selectedBorrowRecord?.borrowId }}</p>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="borrowDetailDialog = false" />
              </div>

              <div v-if="selectedBorrowRecord" class="borrow-detail-grid">
                <div>
                  <span>Mã phiếu</span>
                  <b>{{ selectedBorrowRecord.borrowId }}</b>
                </div>

                <div>
                  <span>Trạng thái</span>
                  <b>{{ borrowStatusText(selectedBorrowRecord.status) }}</b>
                </div>

                <div>
                  <span>Độc giả</span>
                  <b>{{ selectedBorrowRecord.readerName }}</b>
                </div>

                <div>
                  <span>Mã độc giả</span>
                  <b>{{ selectedBorrowRecord.readerId }}</b>
                </div>

                <div>
                  <span>Tài liệu</span>
                  <b>{{ selectedBorrowRecord.bookTitle }}</b>
                </div>

                <div>
                  <span>ISBN</span>
                  <b>{{ selectedBorrowRecord.isbn || '--' }}</b>
                </div>

                <div>
                  <span>Ngày mượn</span>
                  <b>{{ selectedBorrowRecord.borrowDate || '--' }}</b>
                </div>

                <div>
                  <span>Hạn trả</span>
                  <b>{{ selectedBorrowRecord.dueDate || '--' }}</b>
                </div>

                <div>
                  <span>Ngày trả</span>
                  <b>{{ selectedBorrowRecord.returnDate || 'Chưa trả' }}</b>
                </div>

                <div>
                  <span>Tiền phạt</span>
                  <b>{{ formatMoney(selectedBorrowRecord.fineAmount) }}</b>
                </div>
              </div>
            </v-card>
          </v-dialog>
        </div>


        <!-- ================= BÁO CÁO ================= -->
        <section v-if="currentMenu === 'reports'" class="report-section">
          
          <v-card class="report-panel" elevation="0">
            <v-row dense align="center">
              <v-col cols="12" md="2">
                <div class="filter-label">Loại báo cáo</div>
                <v-select v-model="reportType" :items="['Tổng hợp', 'Chi tiết mượn trả']" variant="outlined" density="compact" hide-details color="#0d9488" />
              </v-col>
              <v-col cols="12" md="2">
                <div class="filter-label">Khoảng thời gian</div>
                <v-select v-model="reportPeriod" :items="['Tháng này', 'Tuần này', 'Quý này']" variant="outlined" density="compact" hide-details color="#0d9488" />
              </v-col>
              <v-col cols="12" md="2">
                <div class="filter-label">Từ ngày</div>
                <v-text-field v-model="reportFrom" type="date" variant="outlined" density="compact" hide-details color="#0d9488" />
              </v-col>
              <v-col cols="12" md="2">
                <div class="filter-label">Đến ngày</div>
                <v-text-field v-model="reportTo" type="date" variant="outlined" density="compact" hide-details color="#0d9488" />
              </v-col>
              <v-col cols="12" md="2" class="d-flex align-end ml-auto">
                <v-btn block color="#0d9488" class="text-white text-none font-weight-bold mt-4 mt-md-0" height="42" elevation="0" prepend-icon="mdi-chart-bar" @click="generateReport">
                  Tạo báo cáo
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <v-row class="mt-2">
            <v-col v-for="kpi in reportKpis" :key="kpi.title" cols="12" sm="4" lg="2">
              <v-card class="report-kpi-card" elevation="0">
                <div class="d-flex flex-column align-center text-center">
                  <v-avatar :color="kpi.bg" size="48" class="mb-2 rounded-lg">
                    <v-icon :color="kpi.color" size="24">{{ kpi.icon }}</v-icon>
                  </v-avatar>
                  <div class="kpi-title">{{ kpi.title }}</div>
                  <div class="kpi-value">{{ kpi.value }}</div>
                  <div class="kpi-trend" :class="{ 'text-red': kpi.danger }">{{ kpi.trend }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            
            <v-col cols="12" lg="6">
              <v-card class="report-panel h-100" elevation="0">
                <div class="d-flex justify-space-between align-center mb-6">
                  <h3 class="panel-title">Biểu đồ lượt mượn - trả theo ngày</h3>
                  <v-select :items="['7 ngày qua', 'Tháng này']" value="7 ngày qua" variant="outlined" density="compact" hide-details style="max-width: 140px;" class="custom-select" />
                </div><div class="svg-chart-container position-relative">
                  <div class="y-axis-labels">
                    <span>300</span><span>250</span><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
                  </div>
                  
                  <div class="svg-wrapper">
                    <svg viewBox="0 0 700 240" preserveAspectRatio="none" class="w-100 h-100 overflow-visible">
                      <line x1="0" y1="0" x2="700" y2="0" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="80" x2="700" y2="80" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="160" x2="700" y2="160" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="200" x2="700" y2="200" stroke="#f1f5f9" stroke-width="1.5" />
                      <line x1="0" y1="240" x2="700" y2="240" stroke="#e2e8f0" stroke-width="2" />

                      <path d="M 0 240 L 0 160 L 100 88 L 200 128 L 300 40 L 400 88 L 500 56 L 600 104 L 700 120 L 700 240 Z" fill="rgba(16, 185, 129, 0.15)" />
                      <polyline points="0,160 100,88 200,128 300,40 400,88 500,56 600,104 700,120" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      <circle cx="0" cy="160" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="100" cy="88" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="200" cy="128" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="300" cy="40" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="400" cy="88" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="500" cy="56" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="600" cy="104" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      <circle cx="700" cy="120" r="4" fill="white" stroke="#10b981" stroke-width="2" />

                      <path d="M 0 240 L 0 216 L 100 176 L 200 192 L 300 124 L 400 160 L 500 136 L 600 184 L 700 188 L 700 240 Z" fill="rgba(59, 130, 246, 0.15)" />
                      <polyline points="0,216 100,176 200,192 300,124 400,160 500,136 600,184 700,188" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      <circle cx="0" cy="216" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="100" cy="176" r="4" fill="white" stroke="#3b82f6" stroke-width="2" /><circle cx="200" cy="192" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="300" cy="124" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="400" cy="160" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="500" cy="136" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="600" cy="184" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                      <circle cx="700" cy="188" r="4" fill="white" stroke="#3b82f6" stroke-width="2" />
                    </svg>

                    <div class="x-axis-labels">
                      <span>01/06</span><span>03/06</span><span>05/06</span><span>07/06</span><span>09/06</span><span>11/06</span><span>13/06</span><span>15/06</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-center ga-6 mt-4 legend-area">
                  <span><i class="bg-green-accent-4"></i>Lượt mượn</span>
                  <span><i class="bg-blue-accent-2"></i>Lượt trả</span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="3">
              <v-card class="report-panel h-100" elevation="0">
                <h3 class="panel-title mb-6">Lượt mượn theo thể loại</h3>
                <div class="d-flex align-center flex-column">
                  <div class="new-donut">
                    <div class="new-donut-hole">
                      <strong>100%</strong>
                      <span>Tổng</span>
                    </div>
                  </div>
                  <div class="donut-legend mt-6 w-100">
                    <div v-for="cat in categoryStats" :key="cat.name" class="d-flex justify-space-between align-center mb-2">
                      <div class="d-flex align-center font-weight-bold text-caption text-grey-darken-3">
                        <span class="legend-dot" :style="{ background: cat.color }"></span> {{ cat.name }}
                      </div>
                      <b class="text-caption">{{ cat.percent }}%</b>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="3">
              <v-card class="report-panel h-100" elevation="0">
                <div class="d-flex justify-space-between align-center mb-6">
                  <h3 class="panel-title">Top 5 sách được mượn nhiều</h3>
                  <v-select :items="['Top 5', 'Top 10']" value="Top 5" variant="outlined" density="compact" hide-details style="max-width: 90px;" class="custom-select" />
                </div>
                
                <div class="progress-list">
                  <div v-for="book in reportTopBooks" :key="book.title" class="mb-4">
                    <div class="d-flex justify-space-between mb-1"><span class="text-caption font-weight-bold text-grey-darken-3">{{ book.title }}</span>
                      <b class="text-caption">{{ book.count }}</b>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill" :style="{ width: book.percent + '%' }"></div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" lg="4">
              <v-card class="report-panel h-100" elevation="0">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="panel-title">Top 5 độc giả mượn nhiều nhất</h3>
                  <v-select :items="['Tháng này']" value="Tháng này" variant="outlined" density="compact" hide-details style="max-width: 110px;" class="custom-select" />
                </div>
                <v-table density="compact" class="report-table">
                  <thead>
                    <tr><th>#</th><th>Độc giả</th><th>Mã số</th><th class="text-right">Lượt mượn</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in topReaders" :key="user.id">
                      <td>{{ user.rank }}</td>
                      <td class="font-weight-bold text-grey-darken-3">{{ user.name }}</td>
                      <td class="text-grey-darken-1">{{ user.id }}</td>
                      <td class="text-right font-weight-black">{{ user.count }}</td>
                    </tr>
                  </tbody>
                </v-table>
                <v-btn block variant="outlined" color="#0d9488" class="mt-4 text-none font-weight-bold rounded-lg">Xem tất cả</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card class="report-panel h-100" elevation="0">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="panel-title">Top 5 đầu sách được mượn nhiều nhất</h3>
                  <v-select :items="['Tháng này']" value="Tháng này" variant="outlined" density="compact" hide-details style="max-width: 110px;" class="custom-select" />
                </div>
                <v-table density="compact" class="report-table">
                  <thead>
                    <tr><th>#</th><th>Sách</th><th class="text-right">Lượt mượn</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="book in topBooksDetail" :key="book.title">
                      <td>{{ book.rank }}</td>
                      <td class="font-weight-bold text-grey-darken-3">{{ book.title }}</td>
                      <td class="text-right font-weight-black">{{ book.count }}</td>
                    </tr>
                  </tbody>
                </v-table><v-btn block variant="outlined" color="#0d9488" class="mt-4 text-none font-weight-bold rounded-lg">Xem tất cả</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card class="report-panel h-100" elevation="0">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="panel-title">Thống kê theo khoa / đơn vị</h3>
                  <v-select :items="['Tháng này']" value="Tháng này" variant="outlined" density="compact" hide-details style="max-width: 110px;" class="custom-select" />
                </div>
                
                <div class="progress-list mt-6">
                  <div v-for="dept in deptStats" :key="dept.name" class="mb-4">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption font-weight-bold text-grey-darken-4">{{ dept.name }}</span>
                      <b class="text-caption">{{ dept.percent }}%</b>
                    </div>
                    <div class="progress-track bg-grey-lighten-3">
                      <div class="progress-fill" :style="{ width: dept.percent + '%' }"></div>
                    </div>
                    <div class="text-caption text-grey-darken-1 mt-1">{{ dept.count }} lượt mượn</div>
                  </div>
                </div>
                <v-btn block variant="outlined" color="#0d9488" class="mt-4 text-none font-weight-bold rounded-lg">Xem tất cả</v-btn>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="report-panel mt-4" elevation="0">
            <div class="d-flex justify-space-between align-center flex-wrap ga-4">
              <div>
                <strong class="text-teal-darken-2">Ghi chú:</strong>
                <p class="text-caption text-grey-darken-1 mb-0 mt-1">Báo cáo được cập nhật đến {{ lastUpdated }}</p>
              </div>
              <div class="d-flex ga-3">
                <v-btn variant="outlined" color="#0d9488" class="text-none font-weight-bold rounded-lg" prepend-icon="mdi-file-pdf-box">Xuất PDF</v-btn>
                <v-btn variant="outlined" color="#0d9488" class="text-none font-weight-bold rounded-lg" prepend-icon="mdi-file-excel" @click="exportReportCsv">Xuất Excel</v-btn>
                <v-btn color="#0d9488" class="text-white text-none font-weight-bold rounded-lg" prepend-icon="mdi-printer" @click="printReport">In báo cáo</v-btn>
              </div>
            </div>
          </v-card>

          <v-card class="report-panel mt-4 mb-4" elevation="0">
            <h3 class="panel-title mb-3">Sự kiện đồng bộ báo cáo - RabbitMQ Consume Log</h3>
            <div class="terminal-log">
              <div v-for="(log, i) in rabbitMqLogs" :key="i">{{ log }}</div>
            </div>
          </v-card>
        </section>

        <section v-if="currentMenu === 'notifications'" class="notification-v2-page">
          <!-- HERO -->
          <div class="notification-hero-v2">
            <div class="bell-illustration-v2">
              <div class="bell-circle-v2">
                <v-icon size="66">mdi-bell-ring-outline</v-icon>
              </div>
              <span class="spark s1"></span>
              <span class="spark s2"></span>
              <span class="spark s3"></span>
            </div>

            <div class="notification-hero-content-v2">
              <h2>Trung tâm Thông báo</h2>
              <p>Quản lý và theo dõi tất cả thông báo, cảnh báo quá hạn, sự kiện mượn trả và đồng bộ hệ thống.</p>
            </div>

            <div class="notification-hero-side-v2">
              <div>
                <v-icon size="22">mdi-clock-time-four-outline</v-icon>
                <span>Cập nhật lần cuối</span>
                <strong>{{ notificationLastUpdated }}</strong>
              </div>

              <label class="auto-refresh-toggle-v2">
                <span>Tự động làm mới</span>
                <input v-model="autoRefreshNotification" type="checkbox" />
                <i></i>
              </label>
            </div>
          </div>

          <!-- STATS -->
          <div class="notification-stat-grid-v2">
            <button class="notification-stat-card-v2" @click="notificationTab = 'unread'">
              <span class="stat-icon blue"><v-icon size="32">mdi-bell-outline</v-icon></span>
              <div>
                <p>Chưa đọc</p>
                <h3>{{ unreadNotificationCount }}</h3>
                <small>Thông báo mới</small>
              </div>
            </button>

            <button class="notification-stat-card-v2" @click="notificationTab = 'overdue'">
              <span class="stat-icon red"><v-icon size="32">mdi-alert-outline</v-icon></span>
              <div>
                <p>Quá hạn</p>
                <h3>{{ overdueNotificationCount }}</h3>
                <small>Cần xử lý ngay</small>
              </div>
            </button>

            <button class="notification-stat-card-v2" @click="notificationTab = 'system'">
              <span class="stat-icon teal"><v-icon size="32">mdi-cog-outline</v-icon></span>
              <div>
                <p>Hệ thống</p>
                <h3>{{ systemNotificationCount }}</h3>
                <small>Thông báo hệ thống</small>
              </div>
            </button>

            <button class="notification-stat-card-v2" @click="notificationTab = 'done'">
              <span class="stat-icon green"><v-icon size="32">mdi-check-circle-outline</v-icon></span>
              <div>
                <p>Đã xử lý</p>
                <h3>{{ handledNotificationCount }}</h3>
                <small>Trong 30 ngày qua</small>
              </div>
            </button>
          </div>

          <div class="notification-layout-v2">
            <!-- LEFT -->
            <div class="notification-left-v2">
              <div class="notification-toolbar-v2">
                <div class="notification-tabs-v2">
                  <button
                    v-for="tab in notificationTabs"
                    :key="tab.value"
                    :class="{ active: notificationTab === tab.value }"
                    @click="notificationTab = tab.value"
                  >
                    {{ tab.label }}
                    <b v-if="tab.count > 0">{{ tab.count }}</b>
                  </button>
                </div>

                <div class="notification-filter-v2">
                  <div class="notification-search-v2">
                    <v-icon size="20">mdi-magnify</v-icon>
                    <input v-model="notificationSearch" placeholder="Tìm thông báo..." />
                  </div>

                  <select v-model="notificationTypeFilter">
                    <option value="all">Tất cả loại thông báo</option>
                    <option value="borrow">Mượn trả</option>
                    <option value="reader">Độc giả</option>
                    <option value="card">Thẻ thư viện</option>
                    <option value="report">Báo cáo</option>
                    <option value="system">Hệ thống</option>
                  </select>
                </div>
              </div>

              <div class="notification-action-bar-v2">
                <div>
                  <input
                    type="checkbox"
                    :checked="isAllPagedNotificationsSelected"
                    @change="toggleAllNotifications"
                  />
                  <span>Danh sách thông báo</span>
                </div>

                <div class="notification-actions-v2">
                  <button @click="openNotificationCreate">
                    <v-icon size="18">mdi-plus</v-icon>
                    Tạo thông báo
                  </button>

                  <button @click="markSelectedNotificationsRead" :disabled="notificationSelectedIds.length === 0">
                    <v-icon size="18">mdi-check-all</v-icon>
                    Đánh dấu đã đọc
                  </button>

                  <button @click="deleteSelectedNotifications" :disabled="notificationSelectedIds.length === 0" class="danger">
                    <v-icon size="18">mdi-delete-outline</v-icon>
                    Xóa
                  </button>

                  <button @click="exportNotificationsCsv">
                    <v-icon size="18">mdi-file-excel-outline</v-icon>
                    Xuất Excel
                  </button>
                </div>
              </div>

              <div class="notification-list-v2">
                <div
                  v-for="item in pagedNotifications"
                  :key="item.id"
                  class="notification-row-v2"
                  :class="{ unread: !item.read, active: selectedNotification?.id === item.id }"
                  @click="selectNotification(item)"
                >
                  <input
                    v-model="notificationSelectedIds"
                    :value="item.id"
                    type="checkbox"
                    @click.stop
                  />

                  <span class="read-dot" :class="{ read: item.read }"></span>

                  <div class="notification-icon-v2" :style="{ background: item.bg, color: item.color }">
                    <v-icon size="28">{{ item.icon }}</v-icon>
                  </div>

                  <div class="notification-main-v2">
                    <div>
                      <h4>{{ item.title }}</h4>
                      <span class="notification-time-v2">{{ item.time }}</span>
                    </div>

                    <p>{{ item.message }}</p>

                    <div class="notification-meta-v2">
                      <span :class="['priority', item.priority]">{{ notificationPriorityText(item.priority) }}</span>
                      <span>{{ notificationTypeText(item.type) }}</span>
                      <span>{{ item.source }}</span>
                    </div>
                  </div>

                  <span class="notification-status-chip-v2" :class="item.done ? 'done' : 'pending'">
                    {{ item.done ? 'Đã xử lý' : 'Cần xử lý' }}
                  </span>
                </div>

                <div v-if="pagedNotifications.length === 0" class="notification-empty-v2">
                  <v-icon size="58" color="grey-lighten-1">mdi-bell-off-outline</v-icon>
                  <h3>Không có thông báo phù hợp</h3>
                  <p>Hãy thử đổi bộ lọc hoặc nhập từ khóa khác.</p>
                </div>
              </div>

              <div class="notification-pagination-v2">
                <span>
                  Hiển thị {{ notificationPageStart }} - {{ notificationPageEnd }}
                  trong tổng số {{ filteredNotifications.length }} thông báo
                </span>

                <div>
                  <button :disabled="notificationPage === 1" @click="notificationPage--">
                    <v-icon size="18">mdi-chevron-left</v-icon>
                  </button>

                  <button
                    v-for="page in notificationTotalPages"
                    :key="page"
                    :class="{ active: notificationPage === page }"
                    @click="notificationPage = page"
                  >
                    {{ page }}
                  </button>

                  <button :disabled="notificationPage === notificationTotalPages" @click="notificationPage++">
                    <v-icon size="18">mdi-chevron-right</v-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- RIGHT -->
            <div class="notification-right-v2">
              <div class="notification-detail-card-v2">
                <div class="detail-head-v2">
                  <h3>Chi tiết thông báo</h3>
                  <button @click="selectedNotification = null">
                    <v-icon size="20">mdi-close</v-icon>
                  </button>
                </div>

                <div v-if="selectedNotification" class="detail-body-v2">
                  <div class="detail-title-v2">
                    <span :style="{ background: selectedNotification.bg, color: selectedNotification.color }">
                      <v-icon size="38">{{ selectedNotification.icon }}</v-icon>
                    </span>

                    <div>
                      <h4>{{ selectedNotification.title }}</h4>
                      <p>
                        <b :class="['priority-text', selectedNotification.priority]">
                          {{ notificationPriorityText(selectedNotification.priority) }}
                        </b>
                        · {{ selectedNotification.time }}
                      </p>
                    </div>
                  </div>

                  <p class="detail-message-v2">{{ selectedNotification.message }}</p>

                  <div class="reader-normal-box-v2">
                    <span class="normal-person-avatar-v2">
                      <v-icon size="34">mdi-account</v-icon>
                    </span>

                    <div>
                      <strong>{{ selectedNotification.target }}</strong>
                      <p>{{ selectedNotification.readerCode || 'Tài khoản hệ thống' }}</p>
                    </div>
                  </div>

                  <div class="detail-info-grid-v2">
                    <div>
                      <span>Loại thông báo</span>
                      <strong>{{ notificationTypeText(selectedNotification.type) }}</strong>
                    </div>

                    <div>
                      <span>Độ ưu tiên</span>
                      <strong :class="['priority-text', selectedNotification.priority]">
                        {{ notificationPriorityText(selectedNotification.priority) }}
                      </strong>
                    </div>

                    <div>
                      <span>Nguồn</span>
                      <strong>{{ selectedNotification.source }}</strong>
                    </div>

                    <div>
                      <span>Trạng thái</span>
                      <strong>{{ selectedNotification.read ? 'Đã đọc' : 'Chưa đọc' }}</strong>
                    </div>
                  </div>

                  <div class="detail-actions-v2">
                    <button @click="goNotificationTarget">
                      <v-icon size="18">mdi-eye-outline</v-icon>
                      Xem chi tiết
                    </button>

                    <button @click="markNotificationRead(selectedNotification)">
                      <v-icon size="18">mdi-check</v-icon>
                      Đánh dấu đã đọc
                    </button>

                    <button class="danger" @click="deleteNotification(selectedNotification)">
                      <v-icon size="18">mdi-delete-outline</v-icon>
                      Xóa
                    </button>
                  </div>
                </div>

                <div v-else class="detail-empty-v2">
                  <v-icon size="62" color="grey-lighten-1">mdi-bell-outline</v-icon>
                  <p>Chọn một thông báo để xem chi tiết.</p>
                </div>
              </div>

              <div class="activity-card-v2">
                <div class="activity-head-v2">
                  <h3>Nhật ký hoạt động hệ thống</h3>
                  <button @click="showAllNotificationActivities">Xem tất cả</button>
                </div>

                <div class="activity-list-v2">
                  <div v-for="log in notificationActivityLogs" :key="log.time + log.title" class="activity-item-v2">
                    <span :style="{ background: log.color }">
                      <v-icon size="15">{{ log.icon }}</v-icon>
                    </span>

                    <div>
                      <b>{{ log.time }}</b>
                      <h4>{{ log.title }}</h4>
                      <p>{{ log.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CREATE NOTIFICATION DIALOG -->
          <v-dialog v-model="notificationCreateDialog" max-width="680">
            <v-card class="notification-dialog-v2">
              <div class="dialog-head-v2">
                <h3>Tạo thông báo mới</h3>
                <v-btn icon="mdi-close" variant="text" @click="notificationCreateDialog = false" />
              </div>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="notificationForm.title"
                    label="Tiêu đề thông báo"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="notificationForm.message"
                    label="Nội dung thông báo"
                    variant="outlined"
                    color="#0d9488"
                    rows="3"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="notificationForm.type"
                    :items="notificationTypeOptions"
                    label="Loại thông báo"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="notificationForm.priority"
                    :items="notificationPriorityOptions"
                    label="Độ ưu tiên"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="notificationForm.target"
                    label="Người nhận / đối tượng liên quan"
                    variant="outlined"
                    color="#0d9488"
                  />
                </v-col>
              </v-row>

              <div class="dialog-actions-v2">
                <v-btn variant="outlined" color="grey" @click="notificationCreateDialog = false">
                  Hủy
                </v-btn>

                <v-btn color="#0d9488" class="text-white" @click="createNotification">
                  Gửi thông báo
                </v-btn>
              </div>
            </v-card>
          </v-dialog>
        </section>

        <!-- ================= CÀI ĐẶT ================= -->
        <div v-if="currentMenu === 'settings'" class="settings-page">
  <!-- SETTINGS TABS -->
  <v-card class="settings-tabs-card" elevation="0">
    <button
      v-for="tab in settingTabs"
      :key="tab.value"
      class="setting-tab"
      :class="{ active: currentSettingTab === tab.value }"
      @click="currentSettingTab = tab.value"
    >
      <v-icon size="22">{{ tab.icon }}</v-icon>
      <span>{{ tab.title }}</span>
    </button>
  </v-card>

  <!-- TAB 1: CẤU HÌNH HỆ THỐNG -->
  <div v-if="currentSettingTab === 'system'" class="settings-grid">
    <!-- THÔNG TIN THƯ VIỆN -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-bank-outline</v-icon>
        <h3>Thông tin thư viện</h3>
      </div>

      <div class="form-group">
        <label>Tên thư viện</label>
        <input v-model="librarySettings.name" placeholder="Nhập tên thư viện" />
      </div>

      <div class="form-group">
        <label>Địa chỉ</label>
        <input v-model="librarySettings.address" placeholder="Nhập địa chỉ" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input v-model="librarySettings.email" placeholder="Email thư viện" />
        </div>

        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="librarySettings.phone" placeholder="Số điện thoại" />
        </div>
      </div>

      <div class="form-group">
        <label>Website</label>
        <input v-model="librarySettings.website" placeholder="Website thư viện" />
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <textarea v-model="librarySettings.description" rows="3"></textarea>
      </div>

      <button class="save-setting-btn" @click="saveLibrarySettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>

    <!-- CÀI ĐẶT CHUNG -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-cog-outline</v-icon>
        <h3>Cài đặt chung</h3>
      </div>

      <div class="switch-list">
        <div class="switch-row">
          <span>Cho phép đăng ký tài khoản độc giả</span>
          <v-switch v-model="generalSettings.allowRegister" color="#0d9488" hide-details inset />
        </div>

        <div class="switch-row">
          <span>Yêu cầu duyệt khi đăng ký tài khoản</span>
          <v-switch v-model="generalSettings.needApprove" color="#0d9488" hide-details inset />
        </div>

        <div class="switch-row">
          <span>Gia hạn mượn tự động</span>
          <v-switch v-model="generalSettings.autoRenew" color="#0d9488" hide-details inset />
        </div>

        <div class="form-group mt-3">
          <label>Số ngày gia hạn tối đa</label>
          <div class="input-with-unit">
            <input v-model.number="generalSettings.maxRenewDays" type="number" />
            <span>ngày</span>
          </div>
        </div>

        <div class="switch-row">
          <span>Gửi email nhắc hạn mượn</span>
          <v-switch v-model="generalSettings.sendReminderEmail" color="#0d9488" hide-details inset />
        </div>

        <div class="switch-row">
          <span>Hiển thị sách mới trên trang chủ</span>
          <v-switch v-model="generalSettings.showNewBooks" color="#0d9488" hide-details inset />
        </div>
      </div>

      <button class="save-setting-btn" @click="saveGeneralSettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>

    <!-- CÀI ĐẶT MƯỢN TRẢ -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-swap-horizontal</v-icon>
        <h3>Cài đặt mượn trả</h3>
      </div>

      <div class="form-group">
        <label>Số ngày mượn tối đa</label>
        <div class="input-with-unit">
          <input v-model.number="borrowSettings.maxBorrowDays" type="number" />
          <span>ngày</span>
        </div>
      </div>

      <div class="form-group">
        <label>Số sách mượn tối đa</label>
        <div class="input-with-unit">
          <input v-model.number="borrowSettings.maxBooks" type="number" />
          <span>quyển</span>
        </div>
      </div>

      <div class="form-group">
        <label>Phạt quá hạn</label>
        <div class="input-with-unit">
          <input v-model.number="borrowSettings.finePerDay" type="number" />
          <span>VNĐ/ngày</span>
        </div>
      </div>

      <div class="form-group">
        <label>Giới hạn quá hạn trước khi khóa tài khoản</label>
        <div class="input-with-unit">
          <input v-model.number="borrowSettings.lockAfterDays" type="number" />
          <span>ngày</span>
        </div>
      </div>

      <button class="save-setting-btn" @click="saveBorrowSettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>

    <!-- CÀI ĐẶT THÔNG BÁO -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-bell-outline</v-icon>
        <h3>Cài đặt thông báo</h3>
      </div>

      <div class="checkbox-list">
        <label>
          <input v-model="notificationSettings.borrowSuccess" type="checkbox" />
          Thông báo mượn sách thành công
        </label>

        <label>
          <input v-model="notificationSettings.returnSuccess" type="checkbox" />
          Thông báo trả sách thành công
        </label>

        <label>
          <input v-model="notificationSettings.nearDue" type="checkbox" />
          Thông báo sắp hết hạn
        </label>

        <div class="inline-setting">
          <span>Trước</span>
          <input v-model.number="notificationSettings.nearDueDays" type="number" />
          <span>ngày</span>
        </div>

        <label>
          <input v-model="notificationSettings.overdue" type="checkbox" />
          Thông báo quá hạn
        </label>

        <label>
          <input v-model="notificationSettings.newBook" type="checkbox" />
          Thông báo sách mới
        </label>
      </div>

      <button class="save-setting-btn" @click="saveNotificationSettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>

    <!-- CÀI ĐẶT GIAO DIỆN -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-palette-outline</v-icon>
        <h3>Cài đặt giao diện</h3>
      </div>

      <div class="form-group">
        <label>Chủ đề màu chính</label>
        <div class="color-input">
          <input v-model="uiSettings.primaryColor" type="color" />
          <input v-model="uiSettings.primaryColor" />
        </div>
      </div>

      <div class="form-group">
        <label>Ngôn ngữ hiển thị</label>
        <select v-model="uiSettings.language">
          <option>Tiếng Việt</option>
          <option>English</option>
        </select>
      </div>

      <div class="form-group">
        <label>Số lượng bản ghi trên trang</label>
        <select v-model.number="uiSettings.pageSize">
          <option :value="5">5 bản ghi</option>
          <option :value="10">10 bản ghi</option>
          <option :value="20">20 bản ghi</option>
          <option :value="50">50 bản ghi</option>
        </select>
      </div>

      <button class="save-setting-btn" @click="saveUiSettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>

    <!-- BẢO MẬT -->
    <v-card class="setting-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-lock-outline</v-icon>
        <h3>Bảo mật</h3>
      </div>

      <div class="form-group">
        <label>Phiên đăng nhập hết hạn sau</label>
        <div class="input-with-unit">
          <input v-model.number="securitySettings.sessionTimeout" type="number" />
          <span>phút</span>
        </div>
      </div>

      <div class="form-group">
        <label>Đổi mật khẩu định kỳ</label>
        <div class="input-with-unit">
          <input v-model.number="securitySettings.passwordExpireDays" type="number" />
          <span>ngày</span>
        </div>
      </div>

      <div class="switch-row">
        <span>Xác thực 2 lớp (2FA)</span>
        <v-switch v-model="securitySettings.twoFactor" color="#0d9488" hide-details inset />
      </div>

      <div class="switch-row">
        <span>Khóa tài khoản khi đăng nhập sai nhiều lần</span>
        <v-switch v-model="securitySettings.lockOnFailedLogin" color="#0d9488" hide-details inset />
      </div>

      <button class="save-setting-btn" @click="saveSecuritySettings">
        <v-icon size="18">mdi-content-save-outline</v-icon>
        Lưu thay đổi
      </button>
    </v-card>
  </div>

  <!-- TAB 2: QUẢN LÝ TÀI KHOẢN -->
  <div v-if="currentSettingTab === 'accounts'">
    <v-card class="setting-card full-card" elevation="0">
      <div class="setting-card-title row-between">
        <div class="d-flex align-center">
          <v-icon color="#64748b" size="26" class="mr-2">mdi-account-group-outline</v-icon>
          <h3>Quản lý tài khoản quản trị</h3>
        </div>

        <button class="save-setting-btn small" @click="openAddAccount">
          <v-icon size="18">mdi-plus</v-icon>
          Thêm tài khoản
        </button>
      </div>

      <table class="setting-table">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Lần đăng nhập cuối</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="account in adminAccounts" :key="account.id">
            <td>
              <div class="account-cell">
                <v-avatar size="38">
                  <v-img :src="account.avatar" />
                </v-avatar>

                <div>
                  <strong>{{ account.name }}</strong>
                  <span>{{ account.username }}</span>
                </div>
              </div>
            </td>

            <td>{{ account.email }}</td>
            <td>
              <span class="role-chip">{{ account.role }}</span>
            </td>
            <td>
              <span class="account-status" :class="{ locked: !account.active }">
                {{ account.active ? 'Đang hoạt động' : 'Đã khóa' }}
              </span>
            </td>
            <td>{{ account.lastLogin }}</td>
            <td>
              <div class="setting-actions">
                <button @click="editAccount(account)">
                  <v-icon size="18">mdi-pencil-outline</v-icon>
                </button>

                <button @click="toggleAccount(account)">
                  <v-icon size="18">
                    {{ account.active ? 'mdi-lock-outline' : 'mdi-lock-open-outline' }}
                  </v-icon>
                </button>

                <button class="danger" @click="deleteAccount(account)">
                  <v-icon size="18">mdi-delete-outline</v-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </v-card>
  </div>

  <!-- TAB 3: PHÂN QUYỀN -->
  <div v-if="currentSettingTab === 'roles'">
    <v-card class="setting-card full-card" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-shield-account-outline</v-icon>
        <h3>Phân quyền chức năng</h3>
      </div>

      <div class="role-grid">
        <div v-for="role in roles" :key="role.name" class="role-card">
          <h4>{{ role.name }}</h4>
          <p>{{ role.description }}</p>

          <label v-for="permission in rolePermissions" :key="permission.value">
            <input
              v-model="role.permissions"
              type="checkbox"
              :value="permission.value"
            />
            {{ permission.title }}
          </label>

          <button class="save-setting-btn small mt-3" @click="saveRole(role)">
            Lưu phân quyền
          </button>
        </div>
      </div>
    </v-card>
  </div>

  <!-- TAB 4: SAO LƯU DỮ LIỆU -->
  <div v-if="currentSettingTab === 'backup'">
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="setting-card h-100" elevation="0">
          <div class="setting-card-title">
            <v-icon color="#64748b" size="26">mdi-database-export-outline</v-icon>
            <h3>Sao lưu dữ liệu</h3>
          </div>

          <p class="setting-note">
            Sao lưu toàn bộ dữ liệu độc giả, thẻ thư viện, mượn trả và báo cáo.
          </p>

          <button class="save-setting-btn" @click="createBackup">
            <v-icon size="18">mdi-database-export-outline</v-icon>
            Tạo bản sao lưu
          </button>

          <button class="outline-setting-btn mt-3" @click="downloadBackup">
            <v-icon size="18">mdi-download</v-icon>
            Tải bản sao lưu gần nhất
          </button>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="setting-card h-100" elevation="0">
          <div class="setting-card-title">
            <v-icon color="#64748b" size="26">mdi-database-import-outline</v-icon>
            <h3>Khôi phục dữ liệu</h3>
          </div>

          <p class="setting-note">
            Chọn file sao lưu để khôi phục dữ liệu hệ thống.
          </p>

          <input type="file" class="file-input" @change="selectBackupFile" />

          <button class="save-setting-btn mt-3" @click="restoreBackup">
            <v-icon size="18">mdi-database-import-outline</v-icon>
            Khôi phục dữ liệu
          </button>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="setting-card full-card mt-4" elevation="0">
      <div class="setting-card-title">
        <v-icon color="#64748b" size="26">mdi-history</v-icon>
        <h3>Lịch sử sao lưu</h3>
      </div>

      <table class="setting-table">
        <thead>
          <tr>
            <th>Tên file</th>
            <th>Thời gian</th>
            <th>Dung lượng</th>
            <th>Người tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="backup in backupHistory" :key="backup.file">
            <td class="font-weight-bold">{{ backup.file }}</td>
            <td>{{ backup.time }}</td>
            <td>{{ backup.size }}</td>
            <td>{{ backup.createdBy }}</td>
            <td>
              <button class="outline-mini-btn" @click="downloadBackupItem(backup)">
                Tải xuống
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </v-card>
  </div>

  <!-- TAB 5: NHẬT KÝ HỆ THỐNG -->
  <div v-if="currentSettingTab === 'logs'">
    <v-card class="setting-card full-card" elevation="0">
      <div class="setting-card-title row-between">
        <div class="d-flex align-center">
          <v-icon color="#64748b" size="26" class="mr-2">mdi-file-document-outline</v-icon>
          <h3>Nhật ký hệ thống</h3>
        </div>

        <button class="outline-setting-btn small" @click="clearLogs">
          <v-icon size="18">mdi-delete-outline</v-icon>
          Xóa log
        </button>
      </div>

      <div class="log-filter">
        <select v-model="logLevelFilter">
          <option value="all">Tất cả mức độ</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>

        <input v-model="logSearch" placeholder="Tìm kiếm log..." />
      </div>

      <div class="system-log-box">
        <div
          v-for="log in filteredSystemLogs"
          :key="log.id"
          class="log-row"
          :class="log.level.toLowerCase()"
        >
          <span>[{{ log.level }}]</span>
          <b>{{ log.time }}</b>
          <p>{{ log.message }}</p>
        </div>
      </div>
    </v-card>
  </div>

  <!-- ACCOUNT DIALOG -->
  <v-dialog v-model="accountDialog" max-width="620">
    <v-card class="pa-6 rounded-xl">
      <div class="dialog-head">
        <h3>{{ editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản' }}</h3>
        <v-btn icon="mdi-close" variant="text" @click="accountDialog = false" />
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="accountForm.name" label="Họ tên" variant="outlined" color="#0d9488" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="accountForm.username" label="Tên đăng nhập" variant="outlined" color="#0d9488" />
        </v-col>

        <v-col cols="12">
          <v-text-field v-model="accountForm.email" label="Email" variant="outlined" color="#0d9488" />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="accountForm.role"
            :items="['Admin', 'Thủ thư', 'Nhân viên báo cáo']"
            label="Vai trò"
            variant="outlined"
            color="#0d9488"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="accountForm.active"
            :items="[
              { title: 'Đang hoạt động', value: true },
              { title: 'Đã khóa', value: false }
            ]"
            item-title="title"
            item-value="value"
            label="Trạng thái"
            variant="outlined"
            color="#0d9488"
          />
        </v-col>
      </v-row>

      <div class="d-flex justify-end ga-3 mt-2">
        <v-btn variant="outlined" color="grey" @click="accountDialog = false">
          Hủy
        </v-btn>

        <v-btn color="#0d9488" class="text-white" @click="saveAccount">
          Lưu tài khoản
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

const currentMenu = ref('overview')
const quickSearch = ref('')

const menuItems = [
  { title: 'Tổng quan', icon: 'mdi-home', value: 'overview' },
  { title: 'Quản lý sách', icon: 'mdi-bookshelf', value: 'books' },
  { title: 'Hồ sơ độc giả', icon: 'mdi-account-circle-outline', value: 'readers' },
  { title: 'Thẻ thư viện', icon: 'mdi-card-account-details-outline', value: 'cards' },
  { title: 'Hồ sơ mượn trả', icon: 'mdi-history', value: 'history' },
  { title: 'Báo cáo thống kê', icon: 'mdi-chart-bar', value: 'reports' },
  { title: 'Thông báo', icon: 'mdi-bell-outline', value: 'notifications' },
  { title: 'Cài đặt', icon: 'mdi-cog-outline', value: 'settings' }
]

const currentMenuTitle = computed(() => {
  return menuItems.find((m) => m.value === currentMenu.value)?.title || 'Dashboard'
})

const searchMenu = ref(false)
const notificationMenu = ref(false)
const avatarMenu = ref(false)
const sidebarUserMenu = ref(false)
const profileDialog = ref(false)

const adminProfile = ref({
  name: 'Admin Thư viện',
  role: 'Quản trị hệ thống',
  service: 'Identity & Report Service',
  email: 'admin@library.com',
  phone: '024 1234 5678',
  lastLogin: '15/06/2026 - 14:35',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=160&q=80'
})

const headerNotifications = ref([])

const unreadNotificationCount = computed(() => {
  return headerNotifications.value.filter((item) => !item.read).length
})

const notificationSearch = ref('')
const notificationTab = ref('all')
const notificationTypeFilter = ref('all')
const notificationPage = ref(1)
const notificationPageSize = ref(7)
const notificationSelectedIds = ref([])
const selectedNotification = ref(headerNotifications.value[0])
const autoRefreshNotification = ref(true)
const notificationCreateDialog = ref(false)
const notificationLastUpdated = ref('10:24, 26/04/2026')

const notificationTypeOptions = ['Mượn trả', 'Độc giả', 'Thẻ thư viện', 'Báo cáo', 'Hệ thống']
const notificationPriorityOptions = ['Cao', 'Trung bình', 'Thấp']

const notificationForm = ref({
  title: '',
  message: '',
  type: 'Hệ thống',
  priority: 'Trung bình',
  target: ''
})

const notificationActivityLogs = ref([])

const overdueNotificationCount = computed(() => {
  return headerNotifications.value.filter((item) => item.priority === 'high' || item.title.toLowerCase().includes('quá hạn')).length
})

const systemNotificationCount = computed(() => {
  return headerNotifications.value.filter((item) => item.type === 'system').length
})

const handledNotificationCount = computed(() => {
  return headerNotifications.value.filter((item) => item.done).length
})

const notificationTabs = computed(() => [
  { label: 'Tất cả', value: 'all', count: headerNotifications.value.length },
  { label: 'Chưa đọc', value: 'unread', count: unreadNotificationCount.value },
  { label: 'Quá hạn', value: 'overdue', count: overdueNotificationCount.value },
  { label: 'Mượn trả', value: 'borrow', count: headerNotifications.value.filter((item) => item.type === 'borrow').length },
  { label: 'Hệ thống', value: 'system', count: systemNotificationCount.value }
])

const filteredNotifications = computed(() => {
  const keyword = notificationSearch.value.toLowerCase().trim()

  return headerNotifications.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.title.toLowerCase().includes(keyword) ||
      item.message.toLowerCase().includes(keyword) ||
      item.target.toLowerCase().includes(keyword) ||
      String(item.readerCode || '').toLowerCase().includes(keyword)

    const matchTab =
      notificationTab.value === 'all' ||
      (notificationTab.value === 'unread' && !item.read) ||
      (notificationTab.value === 'overdue' && (item.priority === 'high' || item.title.toLowerCase().includes('quá hạn'))) ||
      item.type === notificationTab.value

    const matchType =
      notificationTypeFilter.value === 'all' ||
      item.type === notificationTypeFilter.value

    return matchKeyword && matchTab && matchType
  })
})

const notificationTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredNotifications.value.length / notificationPageSize.value))
})

const pagedNotifications = computed(() => {
  const start = (notificationPage.value - 1) * notificationPageSize.value
  return filteredNotifications.value.slice(start, start + notificationPageSize.value)
})

const notificationPageStart = computed(() => {
  if (filteredNotifications.value.length === 0) return 0
  return (notificationPage.value - 1) * notificationPageSize.value + 1
})

const notificationPageEnd = computed(() => {
  return Math.min(notificationPage.value * notificationPageSize.value, filteredNotifications.value.length)
})

const isAllPagedNotificationsSelected = computed(() => {
  return pagedNotifications.value.length > 0 &&
    pagedNotifications.value.every((item) => notificationSelectedIds.value.includes(item.id))
})

watch([notificationSearch, notificationTab, notificationTypeFilter], () => {
  notificationPage.value = 1
})

watch(notificationTotalPages, () => {
  if (notificationPage.value > notificationTotalPages.value) {
    notificationPage.value = notificationTotalPages.value
  }
})

const notificationTypeText = (type) => {
  const map = {
    borrow: 'Mượn trả',
    reader: 'Độc giả',
    card: 'Thẻ thư viện',
    report: 'Báo cáo',
    system: 'Hệ thống'
  }

  return map[type] || 'Hệ thống'
}

const notificationPriorityText = (priority) => {
  const map = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
  }

  return map[priority] || 'Trung bình'
}

const mapNotificationType = (type) => {
  const map = {
    'Mượn trả': 'borrow',
    'Độc giả': 'reader',
    'Thẻ thư viện': 'card',
    'Báo cáo': 'report',
    'Hệ thống': 'system'
  }

  return map[type] || 'system'
}

const mapNotificationPriority = (priority) => {
  const map = {
    'Cao': 'high',
    'Trung bình': 'medium',
    'Thấp': 'low'
  }

  return map[priority] || 'medium'
}

const notificationIconByType = (type) => {
  const map = {
    borrow: 'mdi-book-clock-outline',
    reader: 'mdi-account-plus-outline',
    card: 'mdi-card-account-details-outline',
    report: 'mdi-chart-bar',
    system: 'mdi-cog-outline'
  }

  return map[type] || 'mdi-bell-outline'
}

const notificationColorByPriority = (priority) => {
  if (priority === 'high') return { color: '#ef4444', bg: '#fee2e2' }
  if (priority === 'medium') return { color: '#f97316', bg: '#ffedd5' }
  return { color: '#0d9488', bg: '#ccfbf1' }
}

const selectNotification = (item) => {
  selectedNotification.value = item
  item.read = true
}

const markNotificationRead = (item) => {
  if (!item) return
  item.read = true
  addNotificationLog('Đánh dấu thông báo đã đọc', item.title, 'mdi-check', '#10b981')
}

const toggleAllNotifications = () => {
  if (isAllPagedNotificationsSelected.value) {
    notificationSelectedIds.value = notificationSelectedIds.value.filter((id) => {
      return !pagedNotifications.value.some((item) => item.id === id)
    })
  } else {
    const ids = pagedNotifications.value.map((item) => item.id)
    notificationSelectedIds.value = Array.from(new Set([...notificationSelectedIds.value, ...ids]))
  }
}

const markSelectedNotificationsRead = () => {
  if (notificationSelectedIds.value.length === 0) return

  headerNotifications.value.forEach((item) => {
    if (notificationSelectedIds.value.includes(item.id)) {
      item.read = true
    }
  })

  addNotificationLog(`Đánh dấu ${notificationSelectedIds.value.length} thông báo đã đọc`, 'Cập nhật từ chọn nhiều', 'mdi-check-all', '#10b981')
  notificationSelectedIds.value = []
}

const deleteNotification = (item) => {
  if (!item) return

  const ok = confirm(`Bạn muốn xóa thông báo "${item.title}"?`)
  if (!ok) return

  headerNotifications.value = headerNotifications.value.filter((n) => n.id !== item.id)

  if (selectedNotification.value?.id === item.id) {
    selectedNotification.value = headerNotifications.value[0] || null
  }

  addNotificationLog('Xóa thông báo', item.title, 'mdi-delete-outline', '#ef4444')
}

const deleteSelectedNotifications = () => {
  if (notificationSelectedIds.value.length === 0) return

  const ok = confirm(`Bạn muốn xóa ${notificationSelectedIds.value.length} thông báo đã chọn?`)
  if (!ok) return

  headerNotifications.value = headerNotifications.value.filter((item) => !notificationSelectedIds.value.includes(item.id))
  selectedNotification.value = headerNotifications.value[0] || null

  addNotificationLog(`Xóa ${notificationSelectedIds.value.length} thông báo`, 'Cập nhật từ chọn nhiều', 'mdi-delete-outline', '#ef4444')
  notificationSelectedIds.value = []
}

const goNotificationTarget = () => {
  if (!selectedNotification.value) return
  currentMenu.value = selectedNotification.value.menu
}

const openNotificationCreate = () => {
  notificationForm.value = {
    title: '',
    message: '',
    type: 'Hệ thống',
    priority: 'Trung bình',
    target: ''
  }

  notificationCreateDialog.value = true
}

const createNotification = () => {
  if (!notificationForm.value.title || !notificationForm.value.message) {
    alert('Vui lòng nhập tiêu đề và nội dung thông báo.')
    return
  }

  const type = mapNotificationType(notificationForm.value.type)
  const priority = mapNotificationPriority(notificationForm.value.priority)
  const colors = notificationColorByPriority(priority)

  const newNotification = {
    id: Date.now(),
    title: notificationForm.value.title,
    message: notificationForm.value.message,
    time: new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    icon: notificationIconByType(type),
    color: colors.color,
    bg: colors.bg,
    menu: type === 'borrow' ? 'history' : type === 'reader' ? 'readers' : type === 'card' ? 'cards' : type === 'report' ? 'reports' : 'settings',
    type,
    priority,
    source: 'Admin Thư viện',
    target: notificationForm.value.target || 'Toàn hệ thống',
    readerCode: '',
    read: false,
    done: false
  }

  headerNotifications.value.unshift(newNotification)
  selectedNotification.value = newNotification
  notificationCreateDialog.value = false

  addNotificationLog('Tạo thông báo mới', newNotification.title, 'mdi-plus', '#0d9488')
  alert('Đã tạo thông báo mới.')
}

const exportNotificationsCsv = () => {
  const rows = [
    ['Tiêu đề', 'Nội dung', 'Loại', 'Ưu tiên', 'Đối tượng', 'Nguồn', 'Thời gian', 'Trạng thái đọc', 'Xử lý'],
    ...filteredNotifications.value.map((item) => [
      item.title,
      item.message,
      notificationTypeText(item.type),
      notificationPriorityText(item.priority),
      item.target,
      item.source,
      item.time,
      item.read ? 'Đã đọc' : 'Chưa đọc',
      item.done ? 'Đã xử lý' : 'Cần xử lý'
    ])
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'danh-sach-thong-bao.csv'
  link.click()

  URL.revokeObjectURL(url)
}

const refreshNotificationCenter = () => {
  notificationLastUpdated.value = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  addNotificationLog('Làm mới trung tâm thông báo', 'Dữ liệu đã được cập nhật', 'mdi-refresh', '#2563eb')
}

const showAllNotificationActivities = () => {
  alert('Đây là nhật ký hoạt động gần đây của trung tâm thông báo.')
}

const addNotificationLog = (title, desc, icon = 'mdi-bell-outline', color = '#0d9488') => {
  notificationActivityLogs.value.unshift({
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    title,
    desc,
    icon,
    color
  })
}


const quickSearchResults = computed(() => {
  const keyword = quickSearch.value.toLowerCase().trim()

  const allResults = [
    ...menuItems.map((item) => ({
      id: `menu-${item.value}`,
      title: item.title,
      desc: 'Chuyển tới chức năng trong hệ thống',
      icon: item.icon,
      menu: item.value,
      color: '#0d9488',
      bg: '#ccfbf1'
    })),
    {
      id: 'reader-nguyen-van-manh',
      title: 'Nguyễn Văn Mạnh',
      desc: 'Độc giả có phiếu mượn quá hạn',
      icon: 'mdi-account-alert-outline',
      menu: 'history',
      color: '#ef4444',
      bg: '#fee2e2'
    },
    {
      id: 'book-python',
      title: 'Lập trình Python cơ bản',
      desc: 'Tài liệu được mượn nhiều',
      icon: 'mdi-book-open-page-variant-outline',
      menu: 'reports',
      color: '#2563eb',
      bg: '#dbeafe'
    },
    {
      id: 'card-expiring',
      title: 'Thẻ thư viện sắp hết hạn',
      desc: 'Xem danh sách thẻ cần gia hạn',
      icon: 'mdi-card-account-details-outline',
      menu: 'cards',
      color: '#f97316',
      bg: '#ffedd5'
    }
  ]

  if (!keyword) return allResults.slice(0, 6)

  return allResults
    .filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.desc.toLowerCase().includes(keyword)
      )
    })
    .slice(0, 8)
})

const handleQuickSearch = () => {
  searchMenu.value = true

  if (quickSearchResults.value.length === 1) {
    openSearchResult(quickSearchResults.value[0])
  }
}

const openSearchResult = (result) => {
  currentMenu.value = result.menu
  searchMenu.value = false
}

const openNotification = (item) => {
  item.read = true
  selectedNotification.value = item
  currentMenu.value = 'notifications'
  notificationMenu.value = false
}

const markAllNotificationsRead = () => {
  headerNotifications.value.forEach((item) => {
    item.read = true
  })

  notificationMenu.value = false
  sidebarUserMenu.value = false
  addNotificationLog('Đánh dấu tất cả thông báo đã đọc', 'Cập nhật từ menu tài khoản', 'mdi-bell-check-outline', '#10b981')
}

const openProfileDialog = () => {
  profileDialog.value = true
  avatarMenu.value = false
  sidebarUserMenu.value = false
}

const goToSettings = () => {
  currentMenu.value = 'settings'
  profileDialog.value = false
  avatarMenu.value = false
  sidebarUserMenu.value = false
}

const logoutUser = () => {
  const ok = confirm('Bạn có chắc muốn đăng xuất khỏi hệ thống?')
  if (!ok) return

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

const sampleCards = ref([])

const returnHistory = ref([])

const kpiData = []

const barChartData = []

const topBooks = []

const overdueUsers = []


// ===================== TỔNG QUAN MỚI =====================

const overviewChartRange = ref('7 ngày qua')

const overviewKpis = ref([])

const overviewBorrowReturn = ref([])

const overviewStatusStats = ref([])

const overviewOverdueAlerts = ref([])

const overviewTopBooks = ref([])

const overviewCategories = ref([])

const overviewActivities = ref([])

const overviewQuickActions = ref([
  {
    title: 'Tạo phiếu mượn',
    icon: 'mdi-plus',
    menu: 'history',
    color: '#0d9488',
    bg: '#ccfbf1'
  },
  {
    title: 'Gia hạn tài liệu',
    icon: 'mdi-history',
    menu: 'history',
    color: '#2563eb',
    bg: '#dbeafe'
  },
  {
    title: 'Xác nhận trả',
    icon: 'mdi-check-circle',
    menu: 'history',
    color: '#16a34a',
    bg: '#dcfce7'
  },
  {
    title: 'Quản lý độc giả',
    icon: 'mdi-account-group',
    menu: 'readers',
    color: '#7c3aed',
    bg: '#ede9fe'
  },
  {
    title: 'Quản lý đầu sách',
    icon: 'mdi-book-open-page-variant-outline',
    menu: 'cards',
    color: '#f97316',
    bg: '#ffedd5'
  },
  {
    title: 'Báo cáo thống kê',
    icon: 'mdi-chart-bar',
    menu: 'reports',
    color: '#2563eb',
    bg: '#dbeafe'
  }
])

const overviewChartMax = computed(() => {
  const values = overviewBorrowReturn.value.flatMap((item) => [item.borrow, item.returned])
  return Math.max(...values, 40)
})

const makeOverviewPoints = (key) => {
  return overviewBorrowReturn.value.map((item, index) => {
    const x = 30 + index * (640 / (overviewBorrowReturn.value.length - 1))
    const y = 235 - (item[key] / overviewChartMax.value) * 190

    return {
      x,
      y,
      day: item.day,
      value: item[key]
    }
  })
}

const overviewBorrowPoints = computed(() => makeOverviewPoints('borrow'))
const overviewReturnPoints = computed(() => makeOverviewPoints('returned'))

const overviewBorrowPolyline = computed(() => {
  return overviewBorrowPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
})

const overviewReturnPolyline = computed(() => {
  return overviewReturnPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
})

const overviewStatusTotal = computed(() => {
  return overviewStatusStats.value.reduce((sum, item) => sum + item.value, 0)
})

const overviewDonutBg = computed(() => {
  const total = overviewStatusTotal.value || 1
  let current = 0

  const parts = overviewStatusStats.value.map((item) => {
    const start = current
    current += (item.value / total) * 100
    return `${item.color} ${start}% ${current}%`
  })

  return `conic-gradient(${parts.join(', ')})`
})

const overviewPercent = (value) => {
  if (!overviewStatusTotal.value) return '0.0'
  return ((value / overviewStatusTotal.value) * 100).toFixed(1)
}

const overviewFilteredTopBooks = computed(() => {
  const keyword = quickSearch.value.toLowerCase().trim()

  if (!keyword) return overviewTopBooks.value

  return overviewTopBooks.value.filter((book) => {
    return (
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword)
    )
  })
})

const overviewFilteredOverdues = computed(() => {
  const keyword = quickSearch.value.toLowerCase().trim()

  if (!keyword) return overviewOverdueAlerts.value

  return overviewOverdueAlerts.value.filter((item) => {
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.book.toLowerCase().includes(keyword)
    )
  })
})

const runOverviewAction = (action) => {
  currentMenu.value = action.menu
}

const showOverviewActivities = () => {
  alert('Danh sách hoạt động gần đây đang được đồng bộ từ sự kiện mượn - trả.')
}


// ===================== HỒ SƠ ĐỘC GIẢ =====================

const readerSearch = ref('')
const readerStatusFilter = ref('all')
const readerDepartmentFilter = ref('all')
const readerPage = ref(1)
const readerPerPage = ref(7)

const selectedReaderIds = ref([])
const selectedReader = ref(null)
const readerFormDialog = ref(false)
const readerHistoryDialog = ref(false)
const editingReader = ref(null)
const historyReader = ref(null)

const readerStatusOptions = [
  { title: 'Tất cả trạng thái', value: 'all' },
  { title: 'Đang hoạt động', value: 'active' },
  { title: 'Cảnh báo', value: 'warning' },
  { title: 'Đã khóa', value: 'locked' }
]

const readerDepartmentOptions = [
  { title: 'Tất cả khoa/đơn vị', value: 'all' },
  { title: 'CNTT', value: 'CNTT' },
  { title: 'QTKD', value: 'QTKD' },
  { title: 'Ngôn ngữ Anh', value: 'Ngôn ngữ Anh' },
  { title: 'Luật', value: 'Luật' },
  { title: 'Kế toán', value: 'Kế toán' },
  { title: 'Điện tử', value: 'Điện tử' },
  { title: 'Cơ khí', value: 'Cơ khí' }
]

const readerForm = ref({
  name: '',
  email: '',
  phone: '',
  department: '',
  address: '',
  borrowing: 0,
  violations: 0,
  status: 'active'
})

const readerProfiles = ref([])

selectedReader.value = readerProfiles.value[0] || null

const readerStats = computed(() => {
  const total = readerProfiles.value.length
  const active = readerProfiles.value.filter((reader) => reader.status === 'active').length
  const borrowing = readerProfiles.value.filter((reader) => reader.borrowing > 0).length
  const warning = readerProfiles.value.filter(
    (reader) => reader.violations > 0 || reader.status === 'warning' || reader.status === 'locked'
  ).length

  return [
    {
      title: 'Tổng độc giả',
      value: total,
      note: '100%',
      icon: 'mdi-account-group',
      color: '#0d9488',
      bg: 'teal-lighten-5'
    },
    {
      title: 'Đang hoạt động',
      value: active,
      note: total ? `${((active / total) * 100).toFixed(1)}%` : '0%',
      icon: 'mdi-account-check-outline',
      color: '#16a34a',
      bg: 'green-lighten-5'
    },
    {
      title: 'Đang mượn sách',
      value: borrowing,
      note: total ? `${((borrowing / total) * 100).toFixed(1)}%` : '0%',
      icon: 'mdi-book-open-page-variant',
      color: '#2563eb',
      bg: 'blue-lighten-5'
    },
    {
      title: 'Độc giả vi phạm',
      value: warning,
      note: total ? `${((warning / total) * 100).toFixed(1)}%` : '0%',
      icon: 'mdi-alert-outline',
      color: '#ef4444',
      bg: 'red-lighten-5'
    }
  ]
})

const filteredReaders = computed(() => {
  const keyword = `${readerSearch.value} ${quickSearch.value}`.toLowerCase().trim()

  return readerProfiles.value.filter((reader) => {
    const matchKeyword =
      !keyword ||
      reader.id.toLowerCase().includes(keyword) ||
      reader.name.toLowerCase().includes(keyword) ||
      reader.email.toLowerCase().includes(keyword) ||
      reader.phone.toLowerCase().includes(keyword)

    const matchStatus =
      readerStatusFilter.value === 'all' || reader.status === readerStatusFilter.value

    const matchDepartment =
      readerDepartmentFilter.value === 'all' ||
      reader.department.includes(readerDepartmentFilter.value)

    return matchKeyword && matchStatus && matchDepartment
  })
})

const readerTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredReaders.value.length / readerPerPage.value))
})

const paginatedReaders = computed(() => {
  const start = (readerPage.value - 1) * readerPerPage.value
  return filteredReaders.value.slice(start, start + readerPerPage.value)
})

const isAllReadersSelected = computed(() => {
  return (
    paginatedReaders.value.length > 0 &&
    paginatedReaders.value.every((reader) => selectedReaderIds.value.includes(reader.id))
  )
})

watch([readerSearch, quickSearch, readerStatusFilter, readerDepartmentFilter, readerPerPage], () => {
  readerPage.value = 1
})

watch(readerTotalPages, () => {
  if (readerPage.value > readerTotalPages.value) {
    readerPage.value = readerTotalPages.value
  }
})

const readerStatusText = (status) => {
  if (status === 'active') return 'Đang hoạt động'
  if (status === 'warning') return 'Cảnh báo'
  if (status === 'locked') return 'Đã khóa'
  return 'Không rõ'
}

const readerStatusColor = (status) => {
  if (status === 'active') {
    return { bg: 'green-lighten-5', text: 'green-darken-2' }
  }

  if (status === 'warning') {
    return { bg: 'orange-lighten-5', text: 'orange-darken-2' }
  }

  if (status === 'locked') {
    return { bg: 'red-lighten-5', text: 'red-darken-2' }
  }

  return { bg: 'grey-lighten-3', text: 'grey-darken-2' }
}

const selectReader = (reader) => {
  selectedReader.value = reader
}

const resetReaderFilter = () => {
  readerSearch.value = ''
  quickSearch.value = ''
  readerStatusFilter.value = 'all'
  readerDepartmentFilter.value = 'all'
  selectedReaderIds.value = []
  readerPage.value = 1
}

const toggleSelectReaderPage = () => {
  if (isAllReadersSelected.value) {
    selectedReaderIds.value = selectedReaderIds.value.filter(
      (id) => !paginatedReaders.value.some((reader) => reader.id === id)
    )
  } else {
    const ids = paginatedReaders.value.map((reader) => reader.id)
    selectedReaderIds.value = Array.from(new Set([...selectedReaderIds.value, ...ids]))
  }
}

const openAddReader = () => {
  editingReader.value = null
  readerForm.value = {
    name: '',
    email: '',
    phone: '',
    department: '',
    address: '',
    borrowing: 0,
    violations: 0,
    status: 'active'
  }
  readerFormDialog.value = true
}

const openEditReader = (reader) => {
  editingReader.value = reader
  readerForm.value = {
    name: reader.name,
    email: reader.email,
    phone: reader.phone,
    department: reader.department,
    address: reader.address,
    borrowing: reader.borrowing,
    violations: reader.violations,
    status: reader.status
  }
  readerFormDialog.value = true
}

const saveReader = () => {
  if (!readerForm.value.name || !readerForm.value.email || !readerForm.value.phone) {
    alert('Vui lòng nhập đầy đủ họ tên, email và số điện thoại.')
    return
  }

  if (editingReader.value) {
    Object.assign(editingReader.value, readerForm.value)
    selectedReader.value = editingReader.value
    alert('Đã cập nhật hồ sơ độc giả.')
  } else {
    const newId = `DG${String(Date.now()).slice(-6)}`
    const newReader = {
      id: newId,
      registeredAt: new Date().toLocaleDateString('vi-VN'),
      avatar: `https://i.pravatar.cc/100?u=${newId}`,
      ...readerForm.value
    }

    readerProfiles.value.unshift(newReader)
    selectedReader.value = newReader
    alert('Đã thêm độc giả mới.')
  }

  readerFormDialog.value = false
}

const toggleReaderLock = (reader) => {
  if (reader.status === 'locked') {
    reader.status = 'active'
    alert(`Đã mở khóa tài khoản ${reader.name}.`)
  } else {
    reader.status = 'locked'
    alert(`Đã khóa tài khoản ${reader.name}.`)
  }

  selectedReader.value = reader
}

const bulkActivateReaders = () => {
  readerProfiles.value.forEach((reader) => {
    if (selectedReaderIds.value.includes(reader.id)) {
      reader.status = 'active'
    }
  })

  selectedReaderIds.value = []
  alert('Đã kích hoạt các hồ sơ đã chọn.')
}

const bulkLockReaders = () => {
  readerProfiles.value.forEach((reader) => {
    if (selectedReaderIds.value.includes(reader.id)) {
      reader.status = 'locked'
    }
  })

  selectedReaderIds.value = []
  alert('Đã khóa các hồ sơ đã chọn.')
}

const bulkDeleteReaders = () => {
  if (selectedReaderIds.value.length === 0) return

  const ok = confirm(`Bạn có chắc muốn xóa ${selectedReaderIds.value.length} hồ sơ độc giả?`)
  if (!ok) return

  readerProfiles.value = readerProfiles.value.filter(
    (reader) => !selectedReaderIds.value.includes(reader.id)
  )
  selectedReaderIds.value = []
  selectedReader.value = readerProfiles.value[0] || null || null
}

const exportReadersCsv = () => {
  const rows = [
    ['Mã độc giả', 'Họ tên', 'Email', 'Số điện thoại', 'Khoa/Lớp', 'Địa chỉ', 'Ngày đăng ký', 'Sách đang mượn', 'Vi phạm', 'Trạng thái'],
    ...filteredReaders.value.map((reader) => [
      reader.id,
      reader.name,
      reader.email,
      reader.phone,
      reader.department,
      reader.address,
      reader.registeredAt,
      reader.borrowing,
      reader.violations,
      readerStatusText(reader.status)
    ])
  ]

  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'danh-sach-ho-so-doc-gia.csv'
  link.click()

  URL.revokeObjectURL(url)
}

const readerBorrowHistory = ref([])

const openReaderHistory = (reader) => {
  historyReader.value = reader
  readerHistoryDialog.value = true
}
// ===================== THẺ THƯ VIỆN =====================

const cardSearch = ref('')
const cardStatusFilter = ref('all')
const cardTypeFilter = ref('all')
const cardDepartmentFilter = ref('all')
const cardPage = ref(1)
const cardPerPage = ref(5)

const selectedCardIds = ref([])
const selectedLibraryCard = ref(null)
const cardFormDialog = ref(false)
const renewCardDialog = ref(false)
const editingCard = ref(null)
const renewMonths = ref(12)

const cardStatusOptions = [
  { title: 'Tất cả', value: 'all' },
  { title: 'Đang hoạt động', value: 'active' },
  { title: 'Sắp hết hạn', value: 'expiring' },
  { title: 'Hết hạn', value: 'expired' },
  { title: 'Đã khóa', value: 'locked' }
]

const cardTypeOptions = [
  { title: 'Tất cả', value: 'all' },
  { title: 'Sinh viên', value: 'Sinh viên' },
  { title: 'Giảng viên', value: 'Giảng viên' },
  { title: 'Cộng tác viên', value: 'Cộng tác viên' },
  { title: 'Thẻ thường', value: 'Thẻ thường' }
]

const cardDepartmentOptions = [
  { title: 'Tất cả', value: 'all' },
  { title: 'CNTT', value: 'CNTT' },
  { title: 'QTKD', value: 'QTKD' },
  { title: 'Ngôn ngữ Anh', value: 'Ngôn ngữ Anh' },
  { title: 'Luật', value: 'Luật' },
  { title: 'Kế toán', value: 'Kế toán' }
]

const cardForm = ref({
  owner: '',
  email: '',
  department: '',
  type: 'Sinh viên',
  issueDate: '',
  expiryDate: '',
  status: 'active'
})

const libraryCards = ref([])

selectedLibraryCard.value = libraryCards.value[0] || null

const libraryCardStats = computed(() => {
  const total = libraryCards.value.length
  const active = libraryCards.value.filter((card) => card.status === 'active').length
  const expiring = libraryCards.value.filter((card) => card.status === 'expiring').length
  const bad = libraryCards.value.filter((card) => card.status === 'expired' || card.status === 'locked').length

  const ratio = (value) => (total ? `${((value / total) * 100).toFixed(1)}%` : '0%')

  return [
    { title: 'Tổng thẻ', value: total, note: '100%', icon: 'mdi-card-account-details-outline', color: '#0d9488', bg: 'teal-lighten-5' },
    { title: 'Đang hoạt động', value: active, note: ratio(active), icon: 'mdi-check-decagram-outline', color: '#16a34a', bg: 'green-lighten-5' },
    { title: 'Sắp hết hạn', value: expiring, note: ratio(expiring), icon: 'mdi-calendar-alert-outline', color: '#f97316', bg: 'orange-lighten-5' },
    { title: 'Hết hạn / Khóa', value: bad, note: ratio(bad), icon: 'mdi-lock-alert-outline', color: '#ef4444', bg: 'red-lighten-5' }
  ]
})

const filteredLibraryCards = computed(() => {
  const keyword = `${cardSearch.value} ${currentMenu.value === 'cards' ? quickSearch.value : ''}`.toLowerCase().trim()

  return libraryCards.value.filter((card) => {
    const matchKeyword =
      !keyword ||
      card.id.toLowerCase().includes(keyword) ||
      card.owner.toLowerCase().includes(keyword) ||
      card.email.toLowerCase().includes(keyword)

    const matchStatus = cardStatusFilter.value === 'all' || card.status === cardStatusFilter.value
    const matchType = cardTypeFilter.value === 'all' || card.type === cardTypeFilter.value
    const matchDepartment = cardDepartmentFilter.value === 'all' || card.department.includes(cardDepartmentFilter.value)

    return matchKeyword && matchStatus && matchType && matchDepartment
  })
})

const cardTotalPages = computed(() => Math.max(1, Math.ceil(filteredLibraryCards.value.length / cardPerPage.value)))

const paginatedLibraryCards = computed(() => {
  const start = (cardPage.value - 1) * cardPerPage.value
  return filteredLibraryCards.value.slice(start, start + cardPerPage.value)
})

const isAllCardsSelected = computed(() => {
  return (
    paginatedLibraryCards.value.length > 0 &&
    paginatedLibraryCards.value.every((card) => selectedCardIds.value.includes(card.id))
  )
})

watch([cardSearch, quickSearch, cardStatusFilter, cardTypeFilter, cardDepartmentFilter, cardPerPage], () => {
  cardPage.value = 1
})

watch(cardTotalPages, () => {
  if (cardPage.value > cardTotalPages.value) cardPage.value = cardTotalPages.value
})

const cardQuickActions = computed(() => [
  { title: 'Cấp thẻ mới', icon: 'mdi-card-plus-outline', color: '#0d9488', handler: openAddCard },
  { title: 'Gia hạn thẻ', icon: 'mdi-clock-plus-outline', color: '#2563eb', handler: () => openRenewCard(selectedLibraryCard.value) },
  { title: selectedLibraryCard.value?.status === 'locked' ? 'Mở khóa' : 'Khóa thẻ', icon: 'mdi-lock-outline', color: '#f97316', handler: () => toggleCardLock(selectedLibraryCard.value) },
  { title: 'In thẻ', icon: 'mdi-printer-outline', color: '#7c3aed', handler: () => printCard(selectedLibraryCard.value) },
  { title: 'Xuất Excel', icon: 'mdi-download-outline', color: '#0d9488', handler: exportCardsCsv }
])

const cardStatusText = (status) => {
  if (status === 'active') return 'Đang hoạt động'
  if (status === 'expiring') return 'Sắp hết hạn'
  if (status === 'expired') return 'Hết hạn'
  if (status === 'locked') return 'Đã khóa'
  return 'Không rõ'
}

const cardStatusColor = (status) => {
  if (status === 'active') return { bg: 'green-lighten-5', text: 'green-darken-2' }
  if (status === 'expiring') return { bg: 'orange-lighten-5', text: 'orange-darken-2' }
  if (status === 'expired') return { bg: 'red-lighten-5', text: 'red-darken-2' }
  if (status === 'locked') return { bg: 'grey-lighten-3', text: 'grey-darken-2' }
  return { bg: 'grey-lighten-3', text: 'grey-darken-2' }
}

const cardTypeColor = (type) => {
  if (type === 'Sinh viên') return { bg: 'teal-lighten-5', text: 'teal-darken-3' }
  if (type === 'Giảng viên') return { bg: 'blue-lighten-5', text: 'blue-darken-2' }
  if (type === 'Cộng tác viên') return { bg: 'deep-purple-lighten-5', text: 'deep-purple-darken-2' }
  return { bg: 'grey-lighten-3', text: 'grey-darken-2' }
}

const qrFill = (n, seed = '') => {
  const code = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return (n * 7 + code) % 5 !== 0
}

const selectLibraryCard = (card) => {
  selectedLibraryCard.value = card
}

const resetCardFilter = () => {
  cardSearch.value = ''
  quickSearch.value = ''
  cardStatusFilter.value = 'all'
  cardTypeFilter.value = 'all'
  cardDepartmentFilter.value = 'all'
  selectedCardIds.value = []
  cardPage.value = 1
}

const toggleSelectCardPage = () => {
  if (isAllCardsSelected.value) {
    selectedCardIds.value = selectedCardIds.value.filter(
      (id) => !paginatedLibraryCards.value.some((card) => card.id === id)
    )
  } else {
    const ids = paginatedLibraryCards.value.map((card) => card.id)
    selectedCardIds.value = Array.from(new Set([...selectedCardIds.value, ...ids]))
  }
}

const openAddCard = () => {
  editingCard.value = null
  cardForm.value = {
    owner: '',
    email: '',
    department: '',
    type: 'Sinh viên',
    issueDate: new Date().toLocaleDateString('vi-VN'),
    expiryDate: addMonthsToVNDate(new Date().toLocaleDateString('vi-VN'), 12),
    status: 'active'
  }
  cardFormDialog.value = true
}

const openEditCard = (card) => {
  editingCard.value = card
  cardForm.value = {
    owner: card.owner,
    email: card.email,
    department: card.department,
    type: card.type,
    issueDate: card.issueDate,
    expiryDate: card.expiryDate,
    status: card.status
  }
  selectedLibraryCard.value = card
  cardFormDialog.value = true
}

const saveLibraryCard = () => {
  if (!cardForm.value.owner || !cardForm.value.email || !cardForm.value.expiryDate) {
    alert('Vui lòng nhập đầy đủ chủ thẻ, email và ngày hết hạn.')
    return
  }

  if (editingCard.value) {
    Object.assign(editingCard.value, cardForm.value)
    selectedLibraryCard.value = editingCard.value
    alert('Đã cập nhật thẻ thư viện.')
  } else {
    const newId = `LIB-2026-${String(libraryCards.value.length + 1).padStart(3, '0')}`
    const newCard = {
      id: newId,
      avatar: `https://i.pravatar.cc/100?u=${newId}`,
      ...cardForm.value
    }
    libraryCards.value.unshift(newCard)
    selectedLibraryCard.value = newCard
    alert('Đã cấp thẻ thư viện mới.')
  }

  cardFormDialog.value = false
}

const openRenewCard = (card) => {
  if (!card) return
  selectedLibraryCard.value = card
  renewMonths.value = 12
  renewCardDialog.value = true
}

const renewSelectedCard = () => {
  if (!selectedLibraryCard.value) return
  selectedLibraryCard.value.expiryDate = addMonthsToVNDate(selectedLibraryCard.value.expiryDate, renewMonths.value)
  selectedLibraryCard.value.status = 'active'
  renewCardDialog.value = false
  alert(`Đã gia hạn thẻ ${selectedLibraryCard.value.id} thêm ${renewMonths.value} tháng.`)
}

const addMonthsToVNDate = (dateText, months) => {
  const parts = dateText.split('/').map(Number)
  const day = parts[0] || 1
  const month = (parts[1] || 1) - 1
  const year = parts[2] || new Date().getFullYear()
  const date = new Date(year, month, day)
  date.setMonth(date.getMonth() + Number(months || 0))
  return date.toLocaleDateString('vi-VN')
}

const toggleCardLock = (card) => {
  if (!card) return
  if (card.status === 'locked') {
    card.status = 'active'
    alert(`Đã mở khóa thẻ ${card.id}.`)
  } else {
    card.status = 'locked'
    alert(`Đã khóa thẻ ${card.id}.`)
  }
  selectedLibraryCard.value = card
}

const printCard = (card) => {
  if (!card) return
  selectedLibraryCard.value = card
  alert(`Đang gửi thẻ ${card.id} của ${card.owner} tới máy in.`)
}

const bulkActivateCards = () => {
  libraryCards.value.forEach((card) => {
    if (selectedCardIds.value.includes(card.id)) card.status = 'active'
  })
  selectedCardIds.value = []
  alert('Đã kích hoạt các thẻ đã chọn.')
}

const bulkLockCards = () => {
  libraryCards.value.forEach((card) => {
    if (selectedCardIds.value.includes(card.id)) card.status = 'locked'
  })
  selectedCardIds.value = []
  alert('Đã khóa các thẻ đã chọn.')
}

const bulkPrintCards = () => {
  alert(`Đã gửi ${selectedCardIds.value.length} thẻ tới máy in.`)
  selectedCardIds.value = []
}

const bulkDeleteCards = () => {
  if (selectedCardIds.value.length === 0) return
  const ok = confirm(`Bạn có chắc muốn xóa ${selectedCardIds.value.length} thẻ thư viện?`)
  if (!ok) return
  libraryCards.value = libraryCards.value.filter((card) => !selectedCardIds.value.includes(card.id))
  selectedCardIds.value = []
  selectedLibraryCard.value = libraryCards.value[0] || null || null
}

const exportCardsCsv = () => {
  const rows = [
    ['Mã thẻ', 'Chủ thẻ', 'Email', 'Khoa/Lớp', 'Loại thẻ', 'Ngày cấp', 'Ngày hết hạn', 'Trạng thái'],
    ...filteredLibraryCards.value.map((card) => [
      card.id,
      card.owner,
      card.email,
      card.department,
      card.type,
      card.issueDate,
      card.expiryDate,
      cardStatusText(card.status)
    ])
  ]

  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'danh-sach-the-thu-vien.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// ===================== BÁO CÁO THỐNG KÊ =====================

// ================= DỮ LIỆU BÁO CÁO THỐNG KÊ (REPORTS) =================
const reportType = ref('Tổng hợp')
const reportPeriod = ref('Tháng này')
const reportFrom = ref('2026-06-01')
const reportTo = ref('2026-06-15')
const lastUpdated = ref('15/06/2026 - 03:54 AM')

const reportKpis = ref([])

const categoryStats = ref([])

const reportTopBooks = ref([])

const topReaders = ref([])

const topBooksDetail = ref([])

const deptStats = ref([])

const rabbitMqLogs = ref([])

const generateReport = () => {
  lastUpdated.value = new Date().toLocaleString('vi-VN')
  rabbitMqLogs.value.push(`[INFO] ${new Date().toLocaleTimeString('vi-VN')} - Cập nhật dữ liệu từ hệ thống thành công.`)
  alert('Đã cập nhật số liệu báo cáo.')
}

const printReport = () => {
  window.print()
}

const exportReportCsv = () => {
  const rows = [
    ['Chỉ số', 'Giá trị', 'Trạng thái'],
    ...reportKpis.value.map(k => [k.title, k.value, k.trend])
  ]
  const csv = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'thong-ke.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// ===================== CÀI ĐẶT HỆ THỐNG =====================



const SETTINGS_KEYS = {
  library: 'library_settings_library',
  general: 'library_settings_general',
  borrow: 'library_borrow_policy',
  notification: 'library_settings_notification',
  ui: 'library_settings_ui',
  security: 'library_settings_security',
  accounts: 'library_admin_accounts',
  roles: 'library_admin_roles',
  backups: 'library_backup_history',
  logs: 'library_system_logs',
  allSettings: 'library_system_settings'
}

const defaultLibrarySettings = {
  name: 'Thư viện Trường Đại học Công nghệ',
  address: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
  email: 'thuvien@unet.edu.vn',
  phone: '024 1234 5678',
  website: 'https://library.unet.edu.vn',
  description: 'Hệ thống quản lý thư viện số - Cung cấp tài nguyên học tập và nghiên cứu cho sinh viên và giảng viên.'
}

const defaultGeneralSettings = {
  allowRegister: true,
  needApprove: true,
  autoRenew: true,
  maxRenewDays: 3,
  sendReminderEmail: false,
  showNewBooks: true
}

const defaultBorrowSettings = {
  maxBorrowDays: 14,
  maxBooks: 5,
  finePerDay: Number(import.meta.env.VITE_FINE_PER_DAY || 5000),
  lockAfterDays: 30
}

const defaultNotificationSettings = {
  borrowSuccess: true,
  returnSuccess: true,
  nearDue: true,
  nearDueDays: 2,
  overdue: true,
  newBook: false
}

const defaultUiSettings = {
  primaryColor: '#0d9488',
  language: 'Tiếng Việt',
  pageSize: 10
}

const defaultSecuritySettings = {
  sessionTimeout: 30,
  passwordExpireDays: 90,
  twoFactor: false,
  lockOnFailedLogin: true
}

const defaultRoles = [
  {
    name: 'Admin',
    description: 'Toàn quyền quản trị hệ thống',
    permissions: ['view_dashboard', 'manage_books', 'manage_readers', 'manage_cards', 'manage_borrow', 'view_reports', 'manage_settings']
  },
  {
    name: 'Thủ thư',
    description: 'Quản lý độc giả, thẻ và mượn trả',
    permissions: ['view_dashboard', 'manage_books', 'manage_readers', 'manage_cards', 'manage_borrow']
  },
  {
    name: 'Nhân viên báo cáo',
    description: 'Chỉ xem và xuất báo cáo thống kê',
    permissions: ['view_dashboard', 'view_reports']
  }
]

const defaultAdminAccounts = [
  {
    id: 'ADM-001',
    name: 'Admin Thư viện',
    username: 'admin',
    email: 'admin@thuvien.com',
    role: 'Admin',
    active: true,
    lastLogin: new Date().toLocaleString('vi-VN'),
    avatar: 'https://ui-avatars.com/api/?name=Admin+Thu+Vien&background=ccfbf1&color=0d9488&bold=true'
  }
]

const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return JSON.parse(JSON.stringify(fallback))

    const parsed = JSON.parse(raw)

    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(fallback))
    }

    return { ...fallback, ...parsed }
  } catch {
    return JSON.parse(JSON.stringify(fallback))
  }
}

const safeParseArray = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) && parsed.length ? parsed : JSON.parse(JSON.stringify(fallback))
  } catch {
    return JSON.parse(JSON.stringify(fallback))
  }
}

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const currentSettingTab = ref('system')

const librarySettings = ref(safeParse(SETTINGS_KEYS.library, defaultLibrarySettings))
const generalSettings = ref(safeParse(SETTINGS_KEYS.general, defaultGeneralSettings))
const borrowSettings = ref(safeParse(SETTINGS_KEYS.borrow, defaultBorrowSettings))
const notificationSettings = ref(safeParse(SETTINGS_KEYS.notification, defaultNotificationSettings))
const uiSettings = ref(safeParse(SETTINGS_KEYS.ui, defaultUiSettings))
const securitySettings = ref(safeParse(SETTINGS_KEYS.security, defaultSecuritySettings))

const adminAccounts = ref(safeParseArray(SETTINGS_KEYS.accounts, defaultAdminAccounts))
const roles = ref(safeParseArray(SETTINGS_KEYS.roles, defaultRoles))
const backupHistory = ref(safeParseArray(SETTINGS_KEYS.backups, []))
const systemLogs = ref(safeParseArray(SETTINGS_KEYS.logs, [
  {
    id: Date.now(),
    level: 'INFO',
    time: new Date().toLocaleString('vi-VN'),
    message: 'Khởi tạo hệ thống cài đặt'
  }
]))

const accountDialog = ref(false)
const editingAccount = ref(null)
const backupFile = ref(null)
const logLevelFilter = ref('all')
const logSearch = ref('')

const accountForm = ref({
  name: '',
  username: '',
  email: '',
  role: 'Thủ thư',
  active: true
})

const rolePermissions = [
  { title: 'Xem dashboard', value: 'view_dashboard' },
  { title: 'Quản lý sách', value: 'manage_books' },
  { title: 'Quản lý độc giả', value: 'manage_readers' },
  { title: 'Quản lý thẻ thư viện', value: 'manage_cards' },
  { title: 'Quản lý mượn trả', value: 'manage_borrow' },
  { title: 'Xem báo cáo', value: 'view_reports' },
  { title: 'Cấu hình hệ thống', value: 'manage_settings' }
]

const filteredSystemLogs = computed(() => {
  const keyword = logSearch.value.toLowerCase().trim()

  return systemLogs.value.filter((log) => {
    const matchLevel = logLevelFilter.value === 'all' || log.level === logLevelFilter.value
    const matchKeyword =
      !keyword ||
      log.message.toLowerCase().includes(keyword) ||
      log.time.toLowerCase().includes(keyword)

    return matchLevel && matchKeyword
  })
})

const addSystemLog = (level, message) => {
  systemLogs.value.unshift({
    id: Date.now() + Math.random(),
    level,
    time: new Date().toLocaleString('vi-VN'),
    message
  })

  if (systemLogs.value.length > 200) {
    systemLogs.value = systemLogs.value.slice(0, 200)
  }

  writeJson(SETTINGS_KEYS.logs, systemLogs.value)
}

const showSettingMessage = (message) => {
  alert(message)
}

const syncAllSettings = () => {
  const payload = {
    library: librarySettings.value,
    general: generalSettings.value,
    borrow: borrowSettings.value,
    notification: notificationSettings.value,
    ui: uiSettings.value,
    security: securitySettings.value,
    updatedAt: new Date().toISOString()
  }

  writeJson(SETTINGS_KEYS.allSettings, payload)

  // Các key này được các màn khác đọc để chạy thật
  writeJson('library_borrow_policy', borrowSettings.value)
  writeJson('library_general_settings', generalSettings.value)
  writeJson('library_notification_settings', notificationSettings.value)

  document.documentElement.style.setProperty('--main-color', uiSettings.value.primaryColor)
  document.documentElement.style.setProperty('--primary-color', uiSettings.value.primaryColor)

  return payload
}

const saveLibrarySettings = () => {
  writeJson(SETTINGS_KEYS.library, librarySettings.value)
  syncAllSettings()
  addSystemLog('INFO', 'Đã lưu thông tin thư viện')
  showSettingMessage('Đã lưu thông tin thư viện.')
}

const saveGeneralSettings = () => {
  writeJson(SETTINGS_KEYS.general, generalSettings.value)
  syncAllSettings()
  addSystemLog('INFO', 'Đã lưu cài đặt chung')
  showSettingMessage('Đã lưu cài đặt chung.')
}

const saveBorrowSettings = () => {
  const maxBorrowDays = Number(borrowSettings.value.maxBorrowDays || 0)
  const maxBooks = Number(borrowSettings.value.maxBooks || 0)
  const finePerDaySetting = Number(borrowSettings.value.finePerDay || 0)

  if (maxBorrowDays <= 0 || maxBooks <= 0 || finePerDaySetting < 0) {
    showSettingMessage('Cài đặt mượn trả không hợp lệ. Vui lòng kiểm tra lại.')
    return
  }

  writeJson(SETTINGS_KEYS.borrow, borrowSettings.value)
  syncAllSettings()
  addSystemLog('INFO', `Đã lưu cài đặt mượn trả: ${maxBorrowDays} ngày, tối đa ${maxBooks} sách, phạt ${finePerDaySetting}đ/ngày`)
  showSettingMessage('Đã lưu cài đặt mượn trả. Cấu hình này sẽ áp dụng cho phần Hồ sơ mượn trả.')
}

const saveNotificationSettings = () => {
  writeJson(SETTINGS_KEYS.notification, notificationSettings.value)
  syncAllSettings()
  addSystemLog('INFO', 'Đã lưu cài đặt thông báo')
  showSettingMessage('Đã lưu cài đặt thông báo.')
}

const saveUiSettings = () => {
  writeJson(SETTINGS_KEYS.ui, uiSettings.value)
  syncAllSettings()
  addSystemLog('INFO', 'Đã lưu cài đặt giao diện')
  showSettingMessage('Đã lưu cài đặt giao diện.')
}

const saveSecuritySettings = () => {
  writeJson(SETTINGS_KEYS.security, securitySettings.value)
  syncAllSettings()
  addSystemLog('INFO', 'Đã lưu cài đặt bảo mật')
  showSettingMessage('Đã lưu cài đặt bảo mật.')
}

const openAddAccount = () => {
  editingAccount.value = null
  accountForm.value = {
    name: '',
    username: '',
    email: '',
    role: 'Thủ thư',
    active: true
  }
  accountDialog.value = true
}

const editAccount = (account) => {
  editingAccount.value = account
  accountForm.value = {
    name: account.name,
    username: account.username,
    email: account.email,
    role: account.role,
    active: account.active
  }
  accountDialog.value = true
}

const saveAccount = () => {
  if (!accountForm.value.name || !accountForm.value.username || !accountForm.value.email) {
    showSettingMessage('Vui lòng nhập đầy đủ thông tin tài khoản.')
    return
  }

  const duplicate = adminAccounts.value.some((account) => {
    return account.email === accountForm.value.email && account.id !== editingAccount.value?.id
  })

  if (duplicate) {
    showSettingMessage('Email này đã tồn tại.')
    return
  }

  if (editingAccount.value) {
    Object.assign(editingAccount.value, accountForm.value)
    addSystemLog('INFO', `Cập nhật tài khoản quản trị: ${accountForm.value.email}`)
    showSettingMessage('Đã cập nhật tài khoản.')
  } else {
    adminAccounts.value.push({
      id: `ADM-${Date.now()}`,
      lastLogin: 'Chưa đăng nhập',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(accountForm.value.name)}&background=ccfbf1&color=0d9488&bold=true`,
      ...accountForm.value
    })
    addSystemLog('INFO', `Thêm tài khoản quản trị: ${accountForm.value.email}`)
    showSettingMessage('Đã thêm tài khoản mới.')
  }

  writeJson(SETTINGS_KEYS.accounts, adminAccounts.value)
  accountDialog.value = false
}

const toggleAccount = (account) => {
  account.active = !account.active
  writeJson(SETTINGS_KEYS.accounts, adminAccounts.value)
  addSystemLog(account.active ? 'INFO' : 'WARN', `${account.active ? 'Mở khóa' : 'Khóa'} tài khoản ${account.email}`)
  showSettingMessage(account.active ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.')
}

const deleteAccount = (account) => {
  const ok = confirm(`Bạn có chắc muốn xóa tài khoản ${account.name}?`)
  if (!ok) return

  adminAccounts.value = adminAccounts.value.filter((item) => item.id !== account.id)
  writeJson(SETTINGS_KEYS.accounts, adminAccounts.value)
  addSystemLog('WARN', `Xóa tài khoản quản trị: ${account.email}`)
}

const saveRole = (role) => {
  writeJson(SETTINGS_KEYS.roles, roles.value)
  addSystemLog('INFO', `Đã lưu phân quyền cho vai trò ${role.name}`)
  showSettingMessage(`Đã lưu phân quyền cho vai trò ${role.name}.`)
}

const collectBackupData = () => {
  const data = {}

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    data[key] = localStorage.getItem(key)
  }

  return {
    app: 'Digital Library',
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: adminProfile.value?.name || 'Admin Thư viện',
    data
  }
}

const downloadJsonFile = (fileName, payload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const createBackup = () => {
  const payload = collectBackupData()
  const fileName = `backup-library-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`
  const sizeKb = Math.max(1, Math.round(JSON.stringify(payload).length / 1024))

  backupHistory.value.unshift({
    file: fileName,
    time: new Date().toLocaleString('vi-VN'),
    size: `${sizeKb} KB`,
    createdBy: adminProfile.value?.name || 'Admin Thư viện',
    payload
  })

  writeJson(SETTINGS_KEYS.backups, backupHistory.value)
  downloadJsonFile(fileName, payload)
  addSystemLog('INFO', `Tạo bản sao lưu: ${fileName}`)
  showSettingMessage('Đã tạo và tải bản sao lưu dữ liệu.')
}

const downloadBackup = () => {
  if (backupHistory.value.length === 0) {
    createBackup()
    return
  }

  downloadBackupItem(backupHistory.value[0])
}

const downloadBackupItem = (backup) => {
  const payload = backup.payload || collectBackupData()
  downloadJsonFile(backup.file || `backup-library-${Date.now()}.json`, payload)
  addSystemLog('INFO', `Tải xuống bản sao lưu: ${backup.file}`)
}

const selectBackupFile = (event) => {
  backupFile.value = event.target.files?.[0] || null
}

const restoreBackup = async () => {
  if (!backupFile.value) {
    showSettingMessage('Vui lòng chọn file sao lưu trước khi khôi phục.')
    return
  }

  const ok = confirm('Khôi phục dữ liệu sẽ ghi đè dữ liệu hiện tại trong localStorage. Bạn có chắc không?')
  if (!ok) return

  try {
    const text = await backupFile.value.text()
    const payload = JSON.parse(text)

    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('File sao lưu không đúng định dạng.')
    }

    Object.entries(payload.data).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    librarySettings.value = safeParse(SETTINGS_KEYS.library, defaultLibrarySettings)
    generalSettings.value = safeParse(SETTINGS_KEYS.general, defaultGeneralSettings)
    borrowSettings.value = safeParse(SETTINGS_KEYS.borrow, defaultBorrowSettings)
    notificationSettings.value = safeParse(SETTINGS_KEYS.notification, defaultNotificationSettings)
    uiSettings.value = safeParse(SETTINGS_KEYS.ui, defaultUiSettings)
    securitySettings.value = safeParse(SETTINGS_KEYS.security, defaultSecuritySettings)
    adminAccounts.value = safeParseArray(SETTINGS_KEYS.accounts, defaultAdminAccounts)
    roles.value = safeParseArray(SETTINGS_KEYS.roles, defaultRoles)
    backupHistory.value = safeParseArray(SETTINGS_KEYS.backups, [])
    systemLogs.value = safeParseArray(SETTINGS_KEYS.logs, [])

    syncAllSettings()
    addSystemLog('WARN', `Khôi phục dữ liệu từ file ${backupFile.value.name}`)
    showSettingMessage(`Đã khôi phục dữ liệu từ file ${backupFile.value.name}.`)
  } catch (error) {
    addSystemLog('ERROR', `Khôi phục thất bại: ${error.message}`)
    showSettingMessage(`Không thể khôi phục: ${error.message}`)
  }
}

const clearLogs = () => {
  const ok = confirm('Bạn có chắc muốn xóa toàn bộ nhật ký hệ thống?')
  if (!ok) return

  systemLogs.value = []
  writeJson(SETTINGS_KEYS.logs, systemLogs.value)
  showSettingMessage('Đã xóa nhật ký hệ thống.')
}

syncAllSettings()


// ===================== LOAD DỮ LIỆU THẬT TỪ LOCALSTORAGE =====================
// Phần này thay thế toàn bộ dữ liệu fake/demo.
// Dữ liệu được lấy từ các key mà Login/Register/User page đang lưu:
// - library_reader_profiles
// - library_library_cards
// - library_borrow_requests

const readStorageArray = (key) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const makeDefaultAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${safeName}&background=ccfbf1&color=0d9488&bold=true`
}

const normalizeReaderStatus = (status) => {
  const value = String(status || '').toLowerCase()

  if (value.includes('khóa') || value.includes('lock')) return 'locked'
  if (value.includes('cảnh báo') || value.includes('warning')) return 'warning'

  return 'active'
}

const normalizeCardStatus = (status) => {
  const value = String(status || '').toLowerCase()

  if (value.includes('khóa') || value.includes('lock')) return 'locked'
  if (value.includes('hết hạn') || value.includes('expired')) return 'expired'
  if (value.includes('sắp') || value.includes('expiring')) return 'expiring'

  return 'active'
}

const makeToday = () => {
  return new Date().toLocaleDateString('vi-VN')
}

const groupBy = (items, getKey) => {
  return items.reduce((acc, item) => {
    const key = getKey(item) || 'Không xác định'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

const buildTopBooks = (borrowRequests) => {
  const grouped = groupBy(borrowRequests, (item) => item.bookTitle || item.book || item.title)
  const rows = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const max = Math.max(...rows.map((row) => row[1]), 1)

  return rows.map(([title, count], index) => ({
    rank: index + 1,
    title,
    author: borrowRequests.find((item) => (item.bookTitle || item.book || item.title) === title)?.bookAuthor || 'Chưa cập nhật',
    count,
    percent: Math.round((count / max) * 100),
    color: ['#0d9488', '#2563eb', '#7c3aed', '#f97316', '#ef4444'][index] || '#0d9488',
    cover: makeDefaultAvatar(title)
  }))
}

const buildTopReaders = (borrowRequests) => {
  const grouped = groupBy(borrowRequests, (item) => item.readerName || item.user)
  const rows = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return rows.map(([name, count], index) => ({
    rank: index + 1,
    name,
    id: borrowRequests.find((item) => (item.readerName || item.user) === name)?.readerId || '',
    count
  }))
}

const loadDashboardDataFromLocalStorage = () => {
  const storedReaders = readStorageArray('library_reader_profiles')
  const storedCards = readStorageArray('library_library_cards')
  const storedBorrowRequests = readStorageArray('library_borrow_requests')

  readerProfiles.value = storedReaders.map((reader, index) => ({
    id: reader.readerId || reader.cardId || reader.id || `DG-${String(index + 1).padStart(4, '0')}`,
    name: reader.name || reader.fullName || reader.readerName || 'Độc giả',
    email: reader.email || 'Chưa cập nhật',
    phone: reader.phone || 'Chưa cập nhật',
    department: reader.department || reader.className || 'Chưa cập nhật',
    address: reader.address || 'Chưa cập nhật',
    registeredAt: reader.registeredAt || reader.createdAt?.slice(0, 10) || makeToday(),
    borrowing: Number(reader.borrowing || reader.borrowCount || 0),
    violations: Number(reader.violations || 0),
    status: normalizeReaderStatus(reader.status || reader.cardStatus),
    avatar: reader.avatar || makeDefaultAvatar(reader.name || reader.fullName || reader.readerName)
  }))

  selectedReader.value = readerProfiles.value[0] || null

  libraryCards.value = storedCards.map((card, index) => {
    const matchedReader = storedReaders.find((reader) => {
      return (
        reader.cardId === card.cardId ||
        reader.id === card.readerId ||
        reader.email === card.email
      )
    })

    const owner = card.owner || card.readerName || matchedReader?.name || matchedReader?.fullName || 'Độc giả'

    return {
      id: card.cardId || card.id || `LIB-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
      owner,
      email: card.email || matchedReader?.email || 'Chưa cập nhật',
      department: card.department || matchedReader?.department || 'Chưa cập nhật',
      type: card.type || 'Thẻ thường',
      issueDate: card.issueDate || makeToday(),
      expiryDate: card.expiryDate || card.expireDate || 'Chưa cập nhật',
      status: normalizeCardStatus(card.status),
      avatar: card.avatar || makeDefaultAvatar(owner)
    }
  })

  selectedLibraryCard.value = libraryCards.value[0] || null

  returnHistory.value = storedBorrowRequests.map((record) => ({
    user: record.readerName || record.user || 'Độc giả',
    book: record.bookTitle || record.book || 'Tài liệu',
    borrowDate: record.borrowDate || makeToday(),
    returnDate: record.returnDate || record.returnedAt || 'Chưa trả',
    fine: String(record.fineAmount || record.fine || 0)
  }))

  readerBorrowHistory.value = storedBorrowRequests.map((record) => ({
    book: record.bookTitle || record.book || 'Tài liệu',
    borrowedAt: record.borrowDate || makeToday(),
    returnedAt: record.returnDate || record.returnedAt || 'Chưa trả',
    status: record.status === 'Đã trả' ? 'returned' : 'borrowing',
    statusText: record.status || 'Chờ duyệt'
  }))

  headerNotifications.value = [
    ...storedBorrowRequests.slice(0, 5).map((request, index) => ({
      id: `borrow-${request.id || index}`,
      title: 'Yêu cầu mượn sách mới',
      message: `${request.readerName || 'Độc giả'} gửi yêu cầu mượn “${request.bookTitle || request.book || 'Tài liệu'}”.`,
      time: request.createdAt ? new Date(request.createdAt).toLocaleString('vi-VN') : makeToday(),
      icon: 'mdi-book-plus-outline',
      color: '#0d9488',
      bg: '#ccfbf1',
      menu: 'history',
      type: 'borrow',
      priority: 'medium',
      source: 'User Interface',
      target: request.readerName || 'Độc giả',
      readerCode: request.readerId || '',
      read: false,
      done: false
    })),
    ...storedReaders.slice(0, 3).map((reader, index) => ({
      id: `reader-${reader.id || index}`,
      title: 'Đăng ký độc giả mới',
      message: `${reader.name || reader.fullName || 'Độc giả'} đã đăng ký tài khoản và được cấp thẻ thư viện.`,
      time: reader.createdAt ? new Date(reader.createdAt).toLocaleString('vi-VN') : makeToday(),
      icon: 'mdi-account-plus-outline',
      color: '#2563eb',
      bg: '#dbeafe',
      menu: 'readers',
      type: 'reader',
      priority: 'low',
      source: 'Identity Service',
      target: reader.name || reader.fullName || 'Độc giả',
      readerCode: reader.cardId || '',
      read: true,
      done: true
    }))
  ]

  notificationActivityLogs.value = headerNotifications.value.slice(0, 5).map((item) => ({
    time: item.time,
    title: item.title,
    desc: item.target || item.source,
    icon: item.icon,
    color: item.color
  }))

  const totalReaders = readerProfiles.value.length
  const totalCards = libraryCards.value.length
  const totalBorrow = storedBorrowRequests.length
  const returned = storedBorrowRequests.filter((item) => String(item.status || '').includes('trả')).length
  const overdue = storedBorrowRequests.filter((item) => String(item.status || '').includes('quá hạn')).length
  const totalFine = storedBorrowRequests.reduce((sum, item) => sum + Number(item.fineAmount || item.fine || 0), 0)

  overviewKpis.value = [
    {
      title: 'Độc giả đăng ký',
      value: totalReaders,
      trend: 'Dữ liệu từ tài khoản đăng ký',
      icon: 'mdi-account-group',
      color: '#0d9488',
      bg: '#ccfbf1'
    },
    {
      title: 'Thẻ thư viện',
      value: totalCards,
      trend: 'Tự tạo khi độc giả đăng ký',
      icon: 'mdi-card-account-details-outline',
      color: '#2563eb',
      bg: '#dbeafe'
    },
    {
      title: 'Yêu cầu mượn',
      value: totalBorrow,
      trend: 'Dữ liệu từ giao diện User',
      icon: 'mdi-book-arrow-right-outline',
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    {
      title: 'Tiền phạt phát sinh',
      value: `${totalFine.toLocaleString('vi-VN')}đ`,
      trend: 'Tổng phí phạt hiện có',
      icon: 'mdi-cash-multiple',
      color: '#f97316',
      bg: '#ffedd5'
    }
  ]

  overviewBorrowReturn.value = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => ({
    day,
    borrow: index === 6 ? totalBorrow : 0,
    returned: index === 6 ? returned : 0
  }))

  overviewStatusStats.value = [
    { label: 'Đang mượn', value: Math.max(totalBorrow - returned - overdue, 0), color: '#22c55e' },
    { label: 'Đã trả', value: returned, color: '#2563eb' },
    { label: 'Quá hạn', value: overdue, color: '#ef4444' }
  ]

  overviewOverdueAlerts.value = storedBorrowRequests
    .filter((item) => String(item.status || '').includes('quá hạn'))
    .slice(0, 5)
    .map((item) => ({
      name: item.readerName || 'Độc giả',
      book: item.bookTitle || item.book || 'Tài liệu',
      days: Number(item.overdueDays || 0),
      avatar: makeDefaultAvatar(item.readerName || 'Độc giả')
    }))

  overviewTopBooks.value = buildTopBooks(storedBorrowRequests)

  overviewCategories.value = []
  categoryStats.value = []

  overviewActivities.value = [
    ...storedBorrowRequests.slice(0, 4).map((item) => ({
      time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN') : makeToday(),
      title: 'Yêu cầu mượn sách',
      desc: `${item.readerName || 'Độc giả'} - ${item.bookTitle || item.book || 'Tài liệu'}`
    })),
    ...storedReaders.slice(0, 3).map((item) => ({
      time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN') : makeToday(),
      title: 'Độc giả mới',
      desc: item.name || item.fullName || 'Độc giả'
    }))
  ]

  const topBookRows = buildTopBooks(storedBorrowRequests)
  reportTopBooks.value = topBookRows.map((item) => ({
    title: item.title,
    count: item.count,
    percent: item.percent
  }))

  topBooksDetail.value = topBookRows.map((item) => ({
    rank: item.rank,
    title: item.title,
    count: item.count
  }))

  topReaders.value = buildTopReaders(storedBorrowRequests)

  const deptGrouped = groupBy(readerProfiles.value, (item) => item.department)
  const deptTotal = Math.max(readerProfiles.value.length, 1)

  deptStats.value = Object.entries(deptGrouped).map(([name, count]) => ({
    name,
    count,
    percent: Number(((count / deptTotal) * 100).toFixed(1))
  }))

  reportKpis.value = [
    {
      title: 'Tổng lượt mượn',
      value: totalBorrow,
      trend: 'Dữ liệu thật từ yêu cầu mượn',
      icon: 'mdi-book-open-page-variant',
      color: '#0d9488',
      bg: '#ccfbf1'
    },
    {
      title: 'Đã trả',
      value: returned,
      trend: `${returned} lượt trả`,
      icon: 'mdi-keyboard-return',
      color: '#2563eb',
      bg: '#dbeafe'
    },
    {
      title: 'Đang mượn',
      value: Math.max(totalBorrow - returned - overdue, 0),
      trend: 'Đang xử lý',
      icon: 'mdi-clock-outline',
      color: '#f97316',
      bg: '#ffedd5'
    },
    {
      title: 'Quá hạn',
      value: overdue,
      trend: `${overdue} trường hợp`,
      icon: 'mdi-alert-circle-outline',
      color: '#ef4444',
      bg: '#fee2e2',
      danger: overdue > 0
    },
    {
      title: 'Độc giả mới',
      value: totalReaders,
      trend: 'Từ đăng ký tài khoản',
      icon: 'mdi-account-group-outline',
      color: '#a855f7',
      bg: '#f3e8ff'
    },
    {
      title: 'Thẻ đã cấp',
      value: totalCards,
      trend: 'Từ đăng ký thẻ thư viện',
      icon: 'mdi-card-account-details-outline',
      color: '#0ea5e9',
      bg: '#e0f2fe'
    }
  ]

  rabbitMqLogs.value = []
  backupHistory.value = []
  systemLogs.value = []
}

onMounted(() => {
  loadDashboardDataFromLocalStorage()
})


// ================= QUẢN LÝ SÁCH - CATALOG SERVICE NHÓM 1 =================
const catalogApiBaseUrl = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5002/api'

const catalogDemoBooks = [
  {
    id: 'B001',
    isbn: '9786044830348',
    title: 'Đắc nhân tâm',
    author: 'Dale Carnegie',
    publisher: 'NXB Trẻ',
    year: 2020,
    category: 'Kỹ năng sống',
    totalCopies: 15,
    availableCopies: 12,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg',
    description: 'Cuốn sách kinh điển về giao tiếp và nghệ thuật ứng xử.'
  },
  {
    id: 'B002',
    isbn: '9786043652405',
    title: 'Atomic Habits',
    author: 'James Clear',
    publisher: 'NXB Thế Giới',
    year: 2019,
    category: 'Khoa học xã hội',
    totalCopies: 10,
    availableCopies: 8,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    description: 'Hướng dẫn xây dựng thói quen nhỏ để tạo kết quả lớn.'
  },
  {
    id: 'B003',
    isbn: '9786047760436',
    title: 'Sapiens: Lược sử loài người',
    author: 'Yuval Noah Harari',
    publisher: 'NXB Tri Thức',
    year: 2018,
    category: 'Khoa học xã hội',
    totalCopies: 7,
    availableCopies: 0,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    description: 'Lược sử phát triển của loài người từ cổ đại đến hiện đại.'
  },
  {
    id: 'B004',
    isbn: '9786045840644',
    title: 'Nhà giả kim',
    author: 'Paulo Coelho',
    publisher: 'NXB Hội Nhà văn',
    year: 2017,
    category: 'Văn học',
    totalCopies: 8,
    availableCopies: 5,
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg',
    description: 'Câu chuyện về hành trình theo đuổi ước mơ và định mệnh.'
  },
  {
    id: 'B005',
    isbn: '9786043247620',
    title: 'Đời thay đổi khi chúng ta thay đổi',
    author: 'Andrew Matthews',
    publisher: 'NXB Trẻ',
    year: 2021,
    category: 'Kỹ năng sống',
    totalCopies: 20,
    availableCopies: 20,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
    description: 'Sách truyền cảm hứng giúp thay đổi tư duy tích cực.'
  }
]

const catalogBooks = ref([])
const catalogEvents = ref([])
const catalogIsLoading = ref(false)
const catalogBookDialog = ref(false)
const catalogViewDialog = ref(false)
const catalogCopiesDialog = ref(false)
const catalogSelectedBook = ref(null)
const catalogEditingBookId = ref(null)
const catalogSelectedIds = ref([])
const catalogShowFilterPanel = ref(false)
const catalogStatusFilter = ref('all')
const catalogSortMode = ref('newest')
const catalogPage = ref(1)
const catalogPerPage = ref(10)

const catalogFilters = reactive({
  keyword: '',
  category: '',
  year: ''
})

const catalogBookForm = reactive({
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  year: new Date().getFullYear(),
  category: '',
  totalCopies: 1,
  availableCopies: 1,
  coverImage: '',
  description: ''
})

const catalogCopyForm = reactive({
  copyId: ''
})

const catalogSnackbar = ref({
  show: false,
  text: '',
  color: '#0d9488'
})

const catalogGetStatus = (availableCopies, totalCopies) => {
  const available = Number(availableCopies || 0)
  const total = Number(totalCopies || 0)

  if (available <= 0 || total <= 0) return 'out'
  if (available <= 2) return 'low'
  return 'available'
}

const catalogNormalizeBook = (book = {}) => {
  const totalCopies = Number(
    book.totalCopies ??
    book.copyCount ??
    book.copies ??
    book.quantity ??
    book.totalCopy ??
    0
  )

  const availableCopies = Number(
    book.availableCopies ??
    book.availableCopyCount ??
    book.available ??
    book.remainingCopies ??
    book.availableCount ??
    0
  )

  return {
    ...book,
    id: book.id ?? book.bookId ?? book.bookID ?? book.isbn ?? `BOOK-${Date.now()}`,
    bookId: book.bookId ?? book.id ?? book.bookID ?? book.isbn,
    isbn: book.isbn ?? book.ISBN ?? '',
    title: book.title ?? book.name ?? book.bookTitle ?? '',
    author: book.author ?? book.authors ?? '',
    publisher: book.publisher ?? book.publisherName ?? book.nxb ?? '',
    year: Number(book.year ?? book.publishYear ?? book.publishedYear ?? book.yearPublished ?? 0),
    category: book.category ?? book.categoryName ?? book.genre ?? 'Chưa phân loại',
    totalCopies,
    availableCopies,
    coverImage:
      book.coverImage ??
      book.coverUrl ??
      book.imageUrl ??
      book.thumbnail ??
      book.avatar ??
      '',
    description: book.description ?? book.summary ?? '',
    status: catalogGetStatus(availableCopies, totalCopies)
  }
}

const catalogToPayload = (form = {}) => {
  return {
    isbn: form.isbn,
    title: form.title,
    author: form.author,
    publisher: form.publisher,
    nxb: form.publisher,
    year: Number(form.year || 0),
    publishYear: Number(form.year || 0),
    category: form.category,
    categoryName: form.category,
    coverImage: form.coverImage,
    imageUrl: form.coverImage,
    description: form.description,
    totalCopies: Number(form.totalCopies || 0),
    availableCopies: Number(form.availableCopies || 0)
  }
}

const catalogUnwrap = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.books)) return data.books

  return data?.data || data
}

const catalogFetchJson = async (url, options = {}) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('library_token')

  const response = await fetch(`${catalogApiBaseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const catalogCategoryOptions = computed(() => {
  return [...new Set(catalogBooks.value.map((book) => book.category).filter(Boolean))]
})

const catalogYearOptions = computed(() => {
  return [...new Set(catalogBooks.value.map((book) => book.year).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a))
})

const catalogStats = computed(() => {
  const available = catalogBooks.value.filter((book) => book.availableCopies > 0).length
  const warning = catalogBooks.value.filter((book) => book.status === 'low' || book.status === 'out').length

  return {
    total: catalogBooks.value.length,
    available,
    warning,
    copies: catalogBooks.value.reduce((sum, book) => sum + Number(book.totalCopies || 0), 0)
  }
})

const catalogFilteredBooks = computed(() => {
  const keyword = catalogFilters.keyword.toLowerCase().trim()

  let list = catalogBooks.value.filter((book) => {
    const matchKeyword =
      !keyword ||
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.isbn.toLowerCase().includes(keyword)

    const matchCategory = !catalogFilters.category || book.category === catalogFilters.category
    const matchYear = !catalogFilters.year || String(book.year) === String(catalogFilters.year)
    const matchStatus = catalogStatusFilter.value === 'all' || book.status === catalogStatusFilter.value

    return matchKeyword && matchCategory && matchYear && matchStatus
  })

  if (catalogSortMode.value === 'title') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'vi'))
  }

  if (catalogSortMode.value === 'available') {
    list = [...list].sort((a, b) => b.availableCopies - a.availableCopies)
  }

  if (catalogSortMode.value === 'year') {
    list = [...list].sort((a, b) => b.year - a.year)
  }

  return list
})

const catalogTotalPages = computed(() => {
  return Math.max(1, Math.ceil(catalogFilteredBooks.value.length / catalogPerPage.value))
})

const catalogStartIndex = computed(() => {
  return (catalogPage.value - 1) * catalogPerPage.value
})

const catalogEndIndex = computed(() => {
  return Math.min(catalogStartIndex.value + catalogPerPage.value, catalogFilteredBooks.value.length)
})

const catalogPaginatedBooks = computed(() => {
  return catalogFilteredBooks.value.slice(catalogStartIndex.value, catalogEndIndex.value)
})

const catalogVisiblePages = computed(() => {
  const pages = []
  const max = catalogTotalPages.value

  for (let i = 1; i <= max && i <= 3; i++) pages.push(i)

  if (max > 3) {
    if (catalogPage.value > 3 && catalogPage.value < max) pages.push(catalogPage.value)
    if (max > 4) pages.push(max)
  }

  return [...new Set(pages)]
})

const catalogIsAllSelected = computed(() => {
  return catalogPaginatedBooks.value.length > 0 &&
    catalogPaginatedBooks.value.every((book) => catalogSelectedIds.value.includes(book.id))
})

watch([catalogFilters, catalogStatusFilter, catalogSortMode, catalogPerPage], () => {
  catalogPage.value = 1
}, { deep: true })

const catalogShowMessage = (text, color = '#0d9488') => {
  catalogSnackbar.value = {
    show: true,
    text,
    color
  }
}

const catalogSaveLocalBooks = () => {
  localStorage.setItem('library_catalog_books', JSON.stringify(catalogBooks.value))
}

const catalogLoadLocalBooks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('library_catalog_books') || '[]')
    const list = Array.isArray(saved) && saved.length > 0 ? saved : catalogDemoBooks
    return list.map(catalogNormalizeBook)
  } catch {
    return catalogDemoBooks.map(catalogNormalizeBook)
  }
}

const catalogLoadBooks = async () => {
  catalogIsLoading.value = true

  try {
    const data = await catalogFetchJson('/books')
    const list = catalogUnwrap(data)
    catalogBooks.value = Array.isArray(list) ? list.map(catalogNormalizeBook) : []
    catalogSaveLocalBooks()
    catalogShowMessage('Đã tải dữ liệu từ Catalog Service.')
  } catch (error) {
    catalogBooks.value = catalogLoadLocalBooks()
    catalogShowMessage('Không tải được API, đang hiển thị dữ liệu demo/localStorage.', 'orange')
    console.warn('GET /api/books failed:', error)
  } finally {
    catalogIsLoading.value = false
  }
}

const catalogSearchBooks = async () => {
  if (!catalogFilters.keyword && !catalogFilters.category && !catalogFilters.year) {
    await catalogLoadBooks()
    return
  }

  catalogIsLoading.value = true

  try {
    const params = new URLSearchParams()

    if (catalogFilters.keyword) {
      params.set('search', catalogFilters.keyword)
      params.set('keyword', catalogFilters.keyword)
      params.set('q', catalogFilters.keyword)
    }

    if (catalogFilters.category) {
      params.set('category', catalogFilters.category)
    }

    if (catalogFilters.year) {
      params.set('year', catalogFilters.year)
      params.set('publishYear', catalogFilters.year)
    }

    const data = await catalogFetchJson(`/books/search?${params.toString()}`)
    const list = catalogUnwrap(data)
    catalogBooks.value = Array.isArray(list) ? list.map(catalogNormalizeBook) : []
    catalogShowMessage('Đã tìm kiếm sách từ API.')
  } catch (error) {
    catalogShowMessage('Không gọi được API tìm kiếm, đang lọc trên dữ liệu hiện tại.', 'orange')
    console.warn('GET /api/books/search failed:', error)
  } finally {
    catalogIsLoading.value = false
  }
}

const catalogClearSearch = () => {
  catalogFilters.keyword = ''
}

const catalogToggleSelectAll = () => {
  const ids = catalogPaginatedBooks.value.map((book) => book.id)

  if (catalogIsAllSelected.value) {
    catalogSelectedIds.value = catalogSelectedIds.value.filter((id) => !ids.includes(id))
  } else {
    catalogSelectedIds.value = [...new Set([...catalogSelectedIds.value, ...ids])]
  }
}

const catalogResetBookForm = () => {
  catalogEditingBookId.value = null
  catalogBookForm.isbn = ''
  catalogBookForm.title = ''
  catalogBookForm.author = ''
  catalogBookForm.publisher = ''
  catalogBookForm.year = new Date().getFullYear()
  catalogBookForm.category = ''
  catalogBookForm.totalCopies = 1
  catalogBookForm.availableCopies = 1
  catalogBookForm.coverImage = ''
  catalogBookForm.description = ''
}

const catalogOpenCreateBook = () => {
  catalogResetBookForm()
  catalogBookDialog.value = true
}

const catalogOpenEditBook = (book) => {
  catalogEditingBookId.value = book.id
  catalogBookForm.isbn = book.isbn
  catalogBookForm.title = book.title
  catalogBookForm.author = book.author
  catalogBookForm.publisher = book.publisher
  catalogBookForm.year = book.year
  catalogBookForm.category = book.category
  catalogBookForm.totalCopies = book.totalCopies
  catalogBookForm.availableCopies = book.availableCopies
  catalogBookForm.coverImage = book.coverImage
  catalogBookForm.description = book.description
  catalogBookDialog.value = true
}

const catalogOpenViewBook = async (book) => {
  catalogSelectedBook.value = book
  catalogViewDialog.value = true

  try {
    const data = await catalogFetchJson(`/books/${book.id}`)
    catalogSelectedBook.value = catalogNormalizeBook(catalogUnwrap(data))
  } catch {
    catalogSelectedBook.value = book
  }
}

const catalogSaveBook = async () => {
  if (!catalogBookForm.isbn || !catalogBookForm.title || !catalogBookForm.author) {
    catalogShowMessage('Vui lòng nhập ISBN, tiêu đề và tác giả.', 'orange')
    return
  }

  try {
    if (catalogEditingBookId.value) {
      await catalogFetchJson(`/books/${catalogEditingBookId.value}`, {
        method: 'PUT',
        body: JSON.stringify(catalogToPayload(catalogBookForm))
      })
      catalogShowMessage('Đã cập nhật sách qua API.')
    } else {
      await catalogFetchJson('/books', {
        method: 'POST',
        body: JSON.stringify(catalogToPayload(catalogBookForm))
      })
      catalogShowMessage('Đã thêm sách mới qua API.')
    }

    catalogBookDialog.value = false
    await catalogLoadBooks()
  } catch (error) {
    const localBook = catalogNormalizeBook({
      id: catalogEditingBookId.value || `LOCAL-${Date.now()}`,
      ...catalogBookForm
    })

    if (catalogEditingBookId.value) {
      catalogBooks.value = catalogBooks.value.map((book) =>
        book.id === catalogEditingBookId.value ? localBook : book
      )
      catalogShowMessage('API lỗi, đã cập nhật tạm trên localStorage.', 'orange')
    } else {
      catalogBooks.value.unshift(localBook)
      catalogShowMessage('API lỗi, đã thêm tạm trên localStorage.', 'orange')
    }

    catalogSaveLocalBooks()
    catalogBookDialog.value = false
    console.warn('Save book failed:', error)
  }
}

const catalogDeleteBook = async (book) => {
  const ok = window.confirm(`Bạn có chắc muốn xóa sách "${book.title}" không?`)
  if (!ok) return

  try {
    await catalogFetchJson(`/books/${book.id}`, { method: 'DELETE' })
    catalogShowMessage('Đã xóa sách qua API.')
    await catalogLoadBooks()
  } catch (error) {
    catalogBooks.value = catalogBooks.value.filter((item) => item.id !== book.id)
    catalogSaveLocalBooks()
    catalogShowMessage('API lỗi, đã xóa tạm trên localStorage.', 'orange')
    console.warn('Delete book failed:', error)
  }
}

const catalogOpenCopiesDialog = (book) => {
  catalogSelectedBook.value = book
  catalogCopyForm.copyId = ''
  catalogCopiesDialog.value = true
}

const catalogPushAvailabilityEvent = (book, message) => {
  const event = {
    id: Date.now(),
    type: 'book.availability.changed',
    bookId: book.id,
    bookTitle: book.title,
    message,
    createdAt: new Date().toISOString()
  }

  catalogEvents.value.unshift(event)

  window.dispatchEvent(
    new CustomEvent('book.availability.changed', {
      detail: event
    })
  )
}

const catalogCreateCopy = async () => {
  if (!catalogSelectedBook.value) return

  try {
    await catalogFetchJson(`/books/${catalogSelectedBook.value.id}/copies`, {
      method: 'POST',
      body: JSON.stringify({})
    })

    catalogPushAvailabilityEvent(catalogSelectedBook.value, 'Đã thêm bản sao mới')
    catalogShowMessage('Đã thêm bản sao qua API.')
    await catalogLoadBooks()
  } catch (error) {
    const book = catalogBooks.value.find((item) => item.id === catalogSelectedBook.value.id)

    if (book) {
      book.totalCopies += 1
      book.availableCopies += 1
      book.status = catalogGetStatus(book.availableCopies, book.totalCopies)
      catalogPushAvailabilityEvent(book, 'Đã thêm bản sao mới trên localStorage')
      catalogSaveLocalBooks()
    }

    catalogShowMessage('API lỗi, đã thêm bản sao tạm trên localStorage.', 'orange')
    console.warn('Create copy failed:', error)
  }
}

const catalogBorrowCopy = async () => {
  if (!catalogSelectedBook.value || !catalogCopyForm.copyId) {
    catalogShowMessage('Vui lòng nhập copyId.', 'orange')
    return
  }

  try {
    await catalogFetchJson(
      `/books/${catalogSelectedBook.value.id}/copies/${catalogCopyForm.copyId}/borrow`,
      { method: 'PUT' }
    )

    catalogPushAvailabilityEvent(catalogSelectedBook.value, `Copy ${catalogCopyForm.copyId} đã được mượn`)
    catalogShowMessage('Đã cập nhật copy sang trạng thái mượn.')
    await catalogLoadBooks()
  } catch (error) {
    const book = catalogBooks.value.find((item) => item.id === catalogSelectedBook.value.id)

    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1
      book.status = catalogGetStatus(book.availableCopies, book.totalCopies)
      catalogPushAvailabilityEvent(book, `Copy ${catalogCopyForm.copyId} đã được mượn trên localStorage`)
      catalogSaveLocalBooks()
    }

    catalogShowMessage('API lỗi, đã cập nhật mượn tạm trên localStorage.', 'orange')
    console.warn('Borrow copy failed:', error)
  }
}

const catalogReturnCopy = async () => {
  if (!catalogSelectedBook.value || !catalogCopyForm.copyId) {
    catalogShowMessage('Vui lòng nhập copyId.', 'orange')
    return
  }

  try {
    await catalogFetchJson(
      `/books/${catalogSelectedBook.value.id}/copies/${catalogCopyForm.copyId}/return`,
      { method: 'PUT' }
    )

    catalogPushAvailabilityEvent(catalogSelectedBook.value, `Copy ${catalogCopyForm.copyId} đã được trả`)
    catalogShowMessage('Đã cập nhật copy sang trạng thái trả.')
    await catalogLoadBooks()
  } catch (error) {
    const book = catalogBooks.value.find((item) => item.id === catalogSelectedBook.value.id)

    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1
      book.status = catalogGetStatus(book.availableCopies, book.totalCopies)
      catalogPushAvailabilityEvent(book, `Copy ${catalogCopyForm.copyId} đã được trả trên localStorage`)
      catalogSaveLocalBooks()
    }

    catalogShowMessage('API lỗi, đã cập nhật trả tạm trên localStorage.', 'orange')
    console.warn('Return copy failed:', error)
  }
}

const catalogDeleteCopy = async () => {
  if (!catalogSelectedBook.value || !catalogCopyForm.copyId) {
    catalogShowMessage('Vui lòng nhập copyId.', 'orange')
    return
  }

  const ok = window.confirm(`Xóa copy ${catalogCopyForm.copyId}?`)
  if (!ok) return

  try {
    await catalogFetchJson(
      `/books/${catalogSelectedBook.value.id}/copies/${catalogCopyForm.copyId}`,
      { method: 'DELETE' }
    )

    catalogPushAvailabilityEvent(catalogSelectedBook.value, `Copy ${catalogCopyForm.copyId} đã bị xóa`)
    catalogShowMessage('Đã xóa copy qua API.')
    await catalogLoadBooks()
  } catch (error) {
    const book = catalogBooks.value.find((item) => item.id === catalogSelectedBook.value.id)

    if (book && book.totalCopies > 0) {
      book.totalCopies -= 1
      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies
      }

      book.status = catalogGetStatus(book.availableCopies, book.totalCopies)
      catalogPushAvailabilityEvent(book, `Copy ${catalogCopyForm.copyId} đã bị xóa trên localStorage`)
      catalogSaveLocalBooks()
    }

    catalogShowMessage('API lỗi, đã xóa copy tạm trên localStorage.', 'orange')
    console.warn('Delete copy failed:', error)
  }
}

const catalogStatusText = (status) => {
  if (status === 'out') return 'Hết sách'
  if (status === 'low') return 'Sắp hết'
  return 'Có thể mượn'
}

const catalogOnCoverError = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80'
}

catalogLoadBooks()


// ================= CIRCULATION SERVICE - NHÓM 2 =================
const circulationApiBaseUrl = import.meta.env.VITE_CIRCULATION_API_URL || 'http://localhost:5082/api'
const finePerDay = computed(() => Number(JSON.parse(localStorage.getItem('library_borrow_policy') || '{}')?.finePerDay || import.meta.env.VITE_FINE_PER_DAY || 5000))
const maxBorrowLimit = computed(() => Number(JSON.parse(localStorage.getItem('library_borrow_policy') || '{}')?.maxBooks || import.meta.env.VITE_MAX_BORROW_LIMIT || 5))

const circulationRecords = ref([])
const circulationEvents = ref([])
const circulationReaders = ref([])
const circulationBooks = ref([])
const circulationLoading = ref(false)
const borrowFormDialog = ref(false)
const returnDialog = ref(false)
const borrowDetailDialog = ref(false)
const selectedBorrowRecord = ref(null)
const circulationPage = ref(1)
const circulationPerPage = ref(10)

const circulationFilters = reactive({
  keyword: '',
  status: 'all',
  time: 'all'
})

const borrowForm = reactive({
  readerId: '',
  readerName: '',
  readerEmail: '',
  bookId: '',
  bookTitle: '',
  isbn: '',
  borrowDate: '',
  dueDate: ''
})

const returnForm = reactive({
  returnDate: ''
})

const circulationStorageKeys = {
  records: 'library_borrow_requests',
  events: 'library_circulation_events',
  readers: 'library_reader_profiles',
  cards: 'library_library_cards',
  books: 'library_catalog_books'
}

const circulationReadArray = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const circulationWriteArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const formatDateInput = (date = new Date()) => {
  const value = new Date(date)
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDateVi = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('vi-VN')
}

const parseDate = (value) => {
  if (!value) return null

  if (String(value).includes('/')) {
    const [d, m, y] = String(value).split('/')
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  return new Date(value)
}

const daysBetween = (from, to) => {
  const d1 = parseDate(from)
  const d2 = parseDate(to)

  if (!d1 || !d2 || Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0

  const diff = d2.getTime() - d1.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

const formatMoney = (amount) => {
  return `${Number(amount || 0).toLocaleString('vi-VN')}đ`
}

const formatDateTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN')
}

const circulationFetchJson = async (url, options = {}) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('library_token')

  const response = await fetch(`${circulationApiBaseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const circulationUnwrap = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.borrows)) return data.borrows
  return data?.data || data
}

const normalizeBorrowRecord = (item = {}) => {
  const borrowDate = item.borrowDate || item.borrowedAt || item.createdAt || ''
  const dueDate = item.dueDate || item.deadline || item.expectedReturnDate || ''
  const returnDate = item.returnDate || item.returnedAt || ''

  let status = item.status || 'pending'

  if (['Chờ duyệt', 'pending'].includes(status)) status = 'pending'
  if (['Đang mượn', 'borrowing', 'borrowed'].includes(status)) status = 'borrowing'
  if (['Đã trả', 'returned'].includes(status)) status = 'returned'
  if (['Quá hạn', 'overdue'].includes(status)) status = 'overdue'

  const today = formatDateInput()
  const dateForFine = returnDate || today
  const overdueDays = returnDate || status === 'borrowing' || status === 'overdue'
    ? daysBetween(dueDate, dateForFine)
    : 0

  if (!returnDate && status === 'borrowing' && overdueDays > 0) {
    status = 'overdue'
  }

  const fineAmount = Number(item.fineAmount ?? item.fine ?? overdueDays * finePerDay.value ?? 0)

  return {
    id: item.id || item.borrowId || `BR-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    borrowId: item.borrowId || item.id || `BR-${Date.now().toString().slice(-6)}`,
    readerId: item.readerId || item.userId || item.libraryCardNumber || '',
    readerName: item.readerName || item.user || item.fullName || item.name || 'Độc giả',
    readerEmail: item.readerEmail || item.email || '',
    bookId: item.bookId || item.bookID || '',
    bookTitle: item.bookTitle || item.book || item.title || item.bookName || 'Tài liệu',
    bookAuthor: item.bookAuthor || item.author || '',
    isbn: item.isbn || '',
    borrowDate: formatDateVi(borrowDate),
    dueDate: formatDateVi(dueDate),
    returnDate: returnDate ? formatDateVi(returnDate) : '',
    status,
    overdueDays,
    fineAmount,
    finePaid: Boolean(item.finePaid || item.isPaid || item.debtStatus === 'paid'),
    createdAt: item.createdAt || new Date().toISOString()
  }
}

const borrowStatusText = (status) => {
  if (status === 'pending') return 'Chờ duyệt'
  if (status === 'borrowing') return 'Đang mượn'
  if (status === 'returned') return 'Đã trả'
  if (status === 'overdue') return 'Quá hạn'
  return status || 'Không rõ'
}

const circulationStats = computed(() => {
  return {
    total: circulationRecords.value.length,
    borrowing: circulationRecords.value.filter((item) => item.status === 'borrowing' || item.status === 'overdue').length,
    returned: circulationRecords.value.filter((item) => item.status === 'returned').length,
    overdue: circulationRecords.value.filter((item) => item.status === 'overdue').length,
    debt: circulationRecords.value
      .filter((item) => item.fineAmount > 0 && !item.finePaid)
      .reduce((sum, item) => sum + Number(item.fineAmount || 0), 0)
  }
})

const filteredCirculationRecords = computed(() => {
  const keyword = circulationFilters.keyword.toLowerCase().trim()

  return circulationRecords.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.readerName.toLowerCase().includes(keyword) ||
      item.readerId.toLowerCase().includes(keyword) ||
      item.bookTitle.toLowerCase().includes(keyword) ||
      item.borrowId.toLowerCase().includes(keyword)

    const matchStatus =
      circulationFilters.status === 'all' || item.status === circulationFilters.status

    let matchTime = true

    if (circulationFilters.time !== 'all') {
      const date = parseDate(item.borrowDate)
      const now = new Date()

      if (!date || Number.isNaN(date.getTime())) {
        matchTime = false
      } else if (circulationFilters.time === 'today') {
        matchTime = date.toDateString() === now.toDateString()
      } else if (circulationFilters.time === 'week') {
        matchTime = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7
      } else if (circulationFilters.time === 'month') {
        matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }
    }

    return matchKeyword && matchStatus && matchTime
  })
})

const overdueBorrowRecords = computed(() => {
  return circulationRecords.value
    .filter((item) => item.status === 'overdue')
    .sort((a, b) => b.overdueDays - a.overdueDays)
})

const debtBorrowRecords = computed(() => {
  return circulationRecords.value
    .filter((item) => item.fineAmount > 0 && !item.finePaid)
    .sort((a, b) => b.fineAmount - a.fineAmount)
})

const circulationTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCirculationRecords.value.length / circulationPerPage.value))
})

const circulationStartIndex = computed(() => {
  return (circulationPage.value - 1) * circulationPerPage.value
})

const circulationEndIndex = computed(() => {
  return Math.min(circulationStartIndex.value + circulationPerPage.value, filteredCirculationRecords.value.length)
})

const paginatedCirculationRecords = computed(() => {
  return filteredCirculationRecords.value.slice(circulationStartIndex.value, circulationEndIndex.value)
})

watch(circulationFilters, () => {
  circulationPage.value = 1
}, { deep: true })

const saveCirculationRecords = () => {
  circulationWriteArray(circulationStorageKeys.records, circulationRecords.value)
}

const saveCirculationEvents = () => {
  circulationWriteArray(circulationStorageKeys.events, circulationEvents.value)
}

const publishCirculationEvent = (type, record) => {
  const event = {
    id: Date.now(),
    type,
    borrowId: record.borrowId,
    readerId: record.readerId,
    readerName: record.readerName,
    bookId: record.bookId,
    bookTitle: record.bookTitle,
    message: `${record.readerName} - ${record.bookTitle}`,
    createdAt: new Date().toISOString()
  }

  circulationEvents.value.unshift(event)
  saveCirculationEvents()

  window.dispatchEvent(new CustomEvent(type, { detail: event }))
}

const loadCirculationReaders = () => {
  const profiles = circulationReadArray(circulationStorageKeys.readers)
  const cards = circulationReadArray(circulationStorageKeys.cards)

  const readersFromProfiles = profiles.map((item) => ({
    id: item.id || item.readerId || item.libraryCardNumber || item.cardId || item.email,
    name: item.name || item.fullName || item.username || 'Độc giả',
    email: item.email || '',
    status: item.status || 'active'
  }))

  const readersFromCards = cards.map((item) => ({
    id: item.id || item.cardId || item.libraryCardNumber || item.readerId,
    name: item.owner || item.readerName || item.fullName || 'Độc giả',
    email: item.email || '',
    status: item.status || 'active'
  }))

  const currentUser =
    JSON.parse(localStorage.getItem('library_current_user') || 'null') ||
    JSON.parse(localStorage.getItem('library_auth_user') || 'null') ||
    JSON.parse(localStorage.getItem('user') || 'null')

  const currentReader = currentUser && currentUser.role !== 'admin'
    ? [{
        id: currentUser.cardId || currentUser.id || currentUser.email,
        name: currentUser.name || currentUser.fullName || 'Độc giả',
        email: currentUser.email || '',
        status: 'active'
      }]
    : []

  const all = [...readersFromProfiles, ...readersFromCards, ...currentReader]
  const map = new Map()

  all.forEach((item) => {
    if (item.id) map.set(String(item.id), item)
  })

  circulationReaders.value = [...map.values()]
}

const loadCirculationBooks = () => {
  circulationBooks.value = circulationReadArray(circulationStorageKeys.books).map((book) => ({
    id: book.id || book.bookId || book.isbn,
    title: book.title || book.bookTitle || 'Tài liệu',
    isbn: book.isbn || '',
    availableCopies: Number(book.availableCopies || book.available || 0),
    totalCopies: Number(book.totalCopies || book.quantity || 0)
  }))
}

const loadCirculationRecords = async () => {
  circulationLoading.value = true
  loadCirculationReaders()
  loadCirculationBooks()

  try {
    const data = await circulationFetchJson('/borrow-records')
    const list = circulationUnwrap(data)
    circulationRecords.value = Array.isArray(list) ? list.map(normalizeBorrowRecord) : []
  } catch (error) {
    const localRecords = circulationReadArray(circulationStorageKeys.records)
    circulationRecords.value = localRecords.map(normalizeBorrowRecord)
    console.warn('Không tải được API nhóm 2, dùng localStorage:', error)
  } finally {
    circulationEvents.value = circulationReadArray(circulationStorageKeys.events)
    saveCirculationRecords()
    circulationLoading.value = false
  }
}

const resetBorrowForm = () => {
  const now = new Date()
  const due = new Date()
  due.setDate(now.getDate() + 14)

  borrowForm.readerId = ''
  borrowForm.readerName = ''
  borrowForm.readerEmail = ''
  borrowForm.bookId = ''
  borrowForm.bookTitle = ''
  borrowForm.isbn = ''
  borrowForm.borrowDate = formatDateInput(now)
  borrowForm.dueDate = formatDateInput(due)
}

const openCreateBorrow = () => {
  loadCirculationReaders()
  loadCirculationBooks()
  resetBorrowForm()
  borrowFormDialog.value = true
}

const fillBorrowReader = () => {
  const reader = circulationReaders.value.find((item) => item.id === borrowForm.readerId)
  if (!reader) return

  borrowForm.readerName = reader.name
  borrowForm.readerEmail = reader.email
}

const fillBorrowBook = () => {
  const book = circulationBooks.value.find((item) => item.id === borrowForm.bookId)
  if (!book) return

  borrowForm.bookTitle = book.title
  borrowForm.isbn = book.isbn
}

const borrowLimitCheck = computed(() => {
  const current = circulationRecords.value.filter((item) => {
    return String(item.readerId) === String(borrowForm.readerId) &&
      (item.status === 'borrowing' || item.status === 'overdue')
  }).length

  const selectedBook = circulationBooks.value.find((item) => String(item.id) === String(borrowForm.bookId))

  if (!borrowForm.readerId) {
    return { allowed: false, current, limit: maxBorrowLimit.value, message: 'Vui lòng chọn độc giả.' }
  }

  if (!borrowForm.bookId) {
    return { allowed: false, current, limit: maxBorrowLimit.value, message: 'Vui lòng chọn sách.' }
  }

  if (selectedBook && selectedBook.availableCopies <= 0) {
    return { allowed: false, current, limit: maxBorrowLimit.value, message: 'Sách đã hết, không thể tạo phiếu mượn.' }
  }

  if (current >= maxBorrowLimit.value) {
    return { allowed: false, current, limit: maxBorrowLimit.value, message: 'Độc giả đã đạt giới hạn mượn.' }
  }

  return { allowed: true, current, limit: maxBorrowLimit.value, message: 'Đủ điều kiện tạo phiếu mượn.' }
})

const createBorrowRecord = async () => {
  if (!borrowLimitCheck.value.allowed) return

  const payload = {
    readerId: borrowForm.readerId,
    readerName: borrowForm.readerName,
    readerEmail: borrowForm.readerEmail,
    bookId: borrowForm.bookId,
    bookTitle: borrowForm.bookTitle,
    isbn: borrowForm.isbn,
    borrowDate: borrowForm.borrowDate,
    dueDate: borrowForm.dueDate,
    status: 'borrowing'
  }

  try {
    const data = await circulationFetchJson('/borrow-records', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const created = normalizeBorrowRecord(circulationUnwrap(data) || payload)
    circulationRecords.value.unshift(created)
    publishCirculationEvent('book.borrowed', created)
  } catch (error) {
    const created = normalizeBorrowRecord({
      id: Date.now(),
      borrowId: `BR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      ...payload,
      createdAt: new Date().toISOString()
    })

    circulationRecords.value.unshift(created)
    publishCirculationEvent('book.borrowed', created)
    console.warn('API nhóm 2 lỗi, đã lưu phiếu mượn localStorage:', error)
  }

  saveCirculationRecords()
  borrowFormDialog.value = false
  circulationActiveTab.value = 'records'
}

const approveBorrow = async (record) => {
  /*
    Swagger nhóm 2 bạn gửi chưa thấy endpoint duyệt phiếu riêng.
    Vì vậy nút Duyệt sẽ cập nhật localStorage và publish event ở frontend.
    Nếu backend nhóm 2 có endpoint duyệt, thêm API vào đây.
  */
  record.status = 'borrowing'
  publishCirculationEvent('book.borrowed', record)
  saveCirculationRecords()
}

const openReturnDialog = (record) => {
  selectedBorrowRecord.value = record
  returnForm.returnDate = formatDateInput()
  returnDialog.value = true
}

const returnFinePreview = computed(() => {
  if (!selectedBorrowRecord.value) {
    return { overdueDays: 0, fineAmount: 0 }
  }

  const overdueDays = daysBetween(selectedBorrowRecord.value.dueDate, returnForm.returnDate)
  return {
    overdueDays,
    fineAmount: overdueDays * finePerDay.value
  }
})

const returnBorrowRecord = async () => {
  if (!selectedBorrowRecord.value) return

  const record = selectedBorrowRecord.value
  const payload = {
    returnDate: returnForm.returnDate,
    overdueDays: returnFinePreview.value.overdueDays,
    fineAmount: returnFinePreview.value.fineAmount,
    status: 'returned'
  }

  try {
    await circulationFetchJson(`/borrow-records/${record.id}/return`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.warn('Không gọi được API return, cập nhật localStorage:', error)
  }

  record.returnDate = formatDateVi(returnForm.returnDate)
  record.overdueDays = payload.overdueDays
  record.fineAmount = payload.fineAmount
  record.status = 'returned'
  record.finePaid = payload.fineAmount === 0

  publishCirculationEvent('book.returned', record)
  saveCirculationRecords()
  returnDialog.value = false
}

const payFine = async (record) => {
  try {
    await circulationFetchJson(`/fines/${record.id}/pay`, { method: 'POST' })
  } catch (error) {
    console.warn('Không gọi được API pay fine, cập nhật localStorage:', error)
  }

  record.finePaid = true
  saveCirculationRecords()
}

const openBorrowDetail = (record) => {
  selectedBorrowRecord.value = record
  borrowDetailDialog.value = true
}

const exportCirculationCsv = () => {
  const rows = [
    ['Ma phieu', 'Doc gia', 'Tai lieu', 'Ngay muon', 'Han tra', 'Ngay tra', 'Qua han', 'Tien phat', 'Trang thai'],
    ...filteredCirculationRecords.value.map((item) => [
      item.borrowId,
      item.readerName,
      item.bookTitle,
      item.borrowDate,
      item.dueDate,
      item.returnDate || 'Chua tra',
      item.overdueDays,
      item.fineAmount,
      borrowStatusText(item.status)
    ])
  ]

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ho-so-muon-tra-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

loadCirculationRecords()


// ================= CIRCULATION FULL UI - TAB BỔ SUNG =================
const circulationActiveTab = ref('records')

const pendingBorrowRecords = computed(() => {
  return circulationRecords.value.filter((item) => item.status === 'pending')
})

const activeBorrowRecords = computed(() => {
  return circulationRecords.value.filter((item) => item.status === 'borrowing' || item.status === 'overdue')
})

const returnedBorrowRecords = computed(() => {
  return circulationRecords.value.filter((item) => item.status === 'returned')
})

const circulationTabItems = computed(() => [
  {
    title: 'Tất cả phiếu',
    value: 'records',
    icon: 'mdi-format-list-bulleted',
    count: circulationRecords.value.length
  },
  {
    title: 'Tạo phiếu',
    value: 'create',
    icon: 'mdi-plus-box-outline',
    count: ''
  },
  {
    title: 'Đang mượn',
    value: 'active',
    icon: 'mdi-book-open-page-variant',
    count: activeBorrowRecords.value.length
  },
  {
    title: 'Quá hạn',
    value: 'overdue',
    icon: 'mdi-alert-circle-outline',
    count: overdueBorrowRecords.value.length
  },
  {
    title: 'Phí phạt',
    value: 'fines',
    icon: 'mdi-cash-multiple',
    count: debtBorrowRecords.value.length
  },
  {
    title: 'Events',
    value: 'events',
    icon: 'mdi-broadcast',
    count: circulationEvents.value.length
  }
])

const setCirculationTab = (tab) => {
  circulationActiveTab.value = tab

  if (tab === 'create') {
    loadCirculationReaders()
    loadCirculationBooks()
    resetBorrowForm()
  }

  if (tab === 'overdue') {
    circulationFilters.status = 'overdue'
  }

  if (tab === 'active') {
    circulationFilters.status = 'all'
  }
}

</script>

<style scoped>
* {
  font-family: 'Inter', sans-serif !important;
}

.tracking-tight {
  letter-spacing: -0.5px;
}

.active-menu-item {
  background-color: #0d9488 !important;
}

.user-profile-box {
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.user-profile-box:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-input :deep(.v-field--variant-outlined) {
  border-color: #cbd5e1;
}

/* CSS BAR CHART */
.legend-square {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.chart-wrapper {
  height: 180px;
}

.css-bar-chart-container {
  height: 100%;
  border-bottom: 1px solid #e2e8f0;
}

.grid-lines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.grid-line {
  width: 100%;
  border-top: 1px dashed #e2e8f0;
}

.bars-area {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-around;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  width: 50px;
}

.bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: calc(100% - 24px);
  width: 100%;
  gap: 6px;
}

.bar {
  width: 14px;
  border-radius: 2px 2px 0 0;
  position: relative;
}

.borrow-bar {
  background-color: #0d9488;
}

.return-bar {
  background-color: #f97316;
}

.bar-value {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: #0d9488;
}

.return-bar .bar-value {
  color: #f97316;
}

.day-label {
  height: 24px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

/* CSS DONUT CHART */
.css-donut-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#0d9488 0% 87%, #ef4444 87% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-hole {
  width: 110px;
  height: 110px;
  background-color: white;
  border-radius: 50%;
}

/* CUSTOM TABLES */
.table-custom :deep(th),
.reader-table :deep(th) {
  border-bottom: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  height: 38px !important;
}

.table-custom :deep(td),
.reader-table :deep(td) {
  border-bottom: 1px solid #f1f5f9 !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.reader-table-wrapper {
  overflow-x: auto;
}

.reader-table {
  min-width: 960px;
}

.selected-reader-row {
  background-color: #ecfdf5 !important;
}

.reader-stat-card {
  min-height: 112px;
}

.bulk-reader-bar {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.bulk-reader-bar span {
  font-weight: 800;
  color: #334155;
}

.detail-profile-card {
  position: sticky;
  top: 10px;
}

.profile-detail-list {
  display: grid;
  gap: 0;
}

.profile-detail-list div {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #edf2f7;
}

.profile-detail-list span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.profile-detail-list strong {
  color: #111827;
  font-size: 12px;
  font-weight: 850;
}
/* ================= THẺ THƯ VIỆN ================= */
.library-card-preview {
  position: relative;
  min-height: 300px;
  border-radius: 22px;
  padding: 24px;
  overflow: hidden;
  color: white;
  background:
    radial-gradient(circle at right top, rgba(45, 212, 191, 0.35), transparent 34%),
    linear-gradient(135deg, #064e40 0%, #075948 48%, #04362f 100%);
  box-shadow: 0 20px 42px rgba(6, 78, 64, 0.22);
}

.preview-wave {
  position: absolute;
  right: -80px;
  top: 25px;
  width: 330px;
  height: 160px;
  border-radius: 50%;
  border: 1px solid rgba(204, 251, 241, 0.28);
  transform: rotate(-18deg);
}

.preview-wave::after {
  content: "";
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  border: 1px solid rgba(204, 251, 241, 0.18);
}

.preview-head,
.preview-body,
.preview-footer {
  position: relative;
  z-index: 2;
}

.preview-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.preview-logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: white;
  display: grid;
  place-items: center;
}

.preview-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: 0.4px;
}

.preview-head p {
  margin: 2px 0 0;
  color: #ccfbf1;
}

.preview-body {
  display: grid;
  grid-template-columns: 112px 1fr 104px;
  align-items: center;
  gap: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  color: #064e40;
  padding: 18px;
}

.preview-avatar {
  border-radius: 16px !important;
  border: 4px solid rgba(13, 148, 136, 0.15);
}

.preview-info h2 {
  margin: 0 0 6px;
  color: #064e40;
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -0.5px;
}

.preview-info h4 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 17px;
  font-weight: 950;
}

.preview-info p {
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-weight: 700;
}

.preview-dates {
  display: flex;
  gap: 22px;
  color: #475569;
  font-size: 12px;
}

.preview-dates strong {
  color: #0f172a;
}

.preview-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-footer span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
}

.barcode {
  display: flex;
  align-items: end;
  gap: 3px;
  height: 36px;
}

.barcode i {
  width: 3px;
  background: white;
  display: block;
}

.fake-qr {
  display: grid;
  gap: 3px;
  background: white;
  border-radius: 10px;
  padding: 8px;
  border: 1px solid #e2e8f0;
}

.fake-qr.large {
  width: 96px;
  height: 96px;
  grid-template-columns: repeat(6, 1fr);
}

.fake-qr.small {
  width: 36px;
  height: 36px;
  grid-template-columns: repeat(4, 1fr);
  padding: 4px;
  gap: 2px;
}

.fake-qr span {
  border-radius: 2px;
  background: #e5e7eb;
}

.fake-qr span.fill {
  background: #111827;
}

.quick-card-action {
  width: 100%;
  height: 96px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  display: grid;
  place-items: center;
  gap: 6px;
  cursor: pointer;
  transition: 0.22s;
}

.quick-card-action span {
  font-size: 12px;
  font-weight: 900;
}

.quick-card-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.mini-stat-card {
  min-height: 138px;
}

.library-card-table :deep(tbody tr) {
  cursor: pointer;
}

.library-card-table :deep(tbody tr:hover) {
  background: #f0fdfa;
}

@media print {
  body * {
    visibility: hidden;
  }

  .library-card-preview,
  .library-card-preview * {
    visibility: visible;
  }

  .library-card-preview {
    position: fixed;
    left: 20px;
    top: 20px;
    width: 680px;
  }
}



/* ================= FIX THẺ THƯ VIỆN - RÕ CHỮ, GỌN, ĐẸP ================= */
.library-cards-page {
  color: #0f172a;
}

.library-cards-page .section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.library-cards-page .section-title-row h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
}

.library-cards-page .section-title-row p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.card-preview-panel {
  min-height: 340px;
}

.library-id-card {
  position: relative;
  overflow: hidden;
  min-height: 280px;
  border-radius: 22px;
  padding: 22px;
  color: white;
  background: linear-gradient(135deg, #065f46 0%, #047857 52%, #0f766e 100%);
  box-shadow: 0 20px 42px rgba(6, 95, 70, 0.22);
}

.card-wave {
  position: absolute;
  right: -90px;
  top: -70px;
  width: 320px;
  height: 190px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.card-wave.wave-2 {
  top: -20px;
  right: -130px;
  width: 360px;
  height: 220px;
}

.id-card-head,
.id-card-body,
.id-card-foot {
  position: relative;
  z-index: 2;
}

.id-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.id-logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: white;
  display: grid;
  place-items: center;
}

.id-card-head strong {
  display: block;
  font-size: 18px;
  font-weight: 950;
  letter-spacing: 0.5px;
}

.id-card-head p {
  margin: 2px 0 0;
  color: #d1fae5;
  font-size: 13px;
  font-weight: 700;
}

.id-card-body {
  display: grid;
  grid-template-columns: 108px 1fr 96px;
  gap: 18px;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  border-radius: 18px;
  padding: 16px;
}

.card-avatar {
  width: 96px;
  height: 104px;
  border-radius: 14px;
  object-fit: cover;
}

.card-owner-info h2 {
  margin: 0 0 4px;
  font-size: 25px;
  font-weight: 950;
  color: #065f46;
}

.card-owner-info h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 900;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
}

.date-row {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}

.date-row small {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
}

.date-row b {
  display: block;
  color: #0f172a;
  font-size: 12px;
}

.qr-code,
.mini-qr {
  display: grid;
  background: white;
  border: 1px solid #e2e8f0;
}

.qr-code {
  width: 86px;
  height: 86px;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 10px;
}

.qr-code span,
.mini-qr span {
  border-radius: 2px;
  background: #e5e7eb;
}

.qr-code span.filled,
.mini-qr span.filled {
  background: #0f172a;
}

.id-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-top: 16px;
}

.barcode {
  display: flex;
  align-items: end;
  gap: 3px;
}

.barcode i {
  width: 3px;
  background: white;
  display: block;
}

.id-card-foot small {
  display: block;
  text-align: right;
  margin-top: 4px;
  color: #d1fae5;
  font-weight: 800;
}

.quick-card-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.quick-card-btn {
  height: 92px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  gap: 6px;
  font-weight: 900;
  transition: 0.2s;
}

.quick-card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.quick-card-btn span {
  font-size: 13px;
}

.library-card-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.card-stat-box {
  min-height: 118px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  background: #ffffff;
}

.stat-mini-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #f0fdfa;
  margin-bottom: 10px;
}

.card-stat-box p {
  margin: 0;
  color: #64748b;
  font-weight: 800;
  font-size: 13px;
}

.card-stat-box h2 {
  margin: 4px 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
}

.card-stat-box span {
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
}

.library-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.library-card-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1080px;
}

.library-card-table thead {
  background: #f8fafc;
}

.library-card-table th {
  padding: 13px 12px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.library-card-table td {
  padding: 13px 12px;
  border-bottom: 1px solid #edf2f7;
  color: #0f172a;
  font-size: 14px;
  vertical-align: middle;
}

.library-card-table tbody tr {
  cursor: pointer;
}

.library-card-table tbody tr:hover,
.library-card-table tbody tr.selected {
  background: #ecfdf5;
}

.card-id-cell {
  color: #047857 !important;
  font-weight: 950;
}

.owner-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.owner-cell strong {
  display: block;
  color: #0f172a;
  font-weight: 950;
}

.owner-cell span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-top: 2px;
}

.status-pill,
.type-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.status-pill.light {
  background: #d1fae5 !important;
  color: #047857 !important;
}

.status-active {
  background: #dcfce7;
  color: #15803d;
}

.status-expiring {
  background: #ffedd5;
  color: #ea580c;
}

.status-expired {
  background: #fee2e2;
  color: #dc2626;
}

.status-locked {
  background: #e2e8f0;
  color: #475569;
}

.type-sinh-viên,
.type-thẻ-thường {
  background: #ccfbf1;
  color: #047857;
}

.type-giảng-viên {
  background: #dbeafe;
  color: #2563eb;
}

.type-cộng-tác-viên {
  background: #ede9fe;
  color: #7c3aed;
}

.date-danger {
  color: #ef4444;
  font-weight: 950;
}

.date-warning {
  color: #f97316;
  font-weight: 950;
}

.mini-qr {
  width: 36px;
  height: 36px;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 5px;
  border-radius: 8px;
  cursor: pointer;
}

.table-card-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.table-card-actions button {
  width: 34px;
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: white;
  color: #0d9488;
  cursor: pointer;
}

.table-card-actions button.orange {
  color: #f97316;
}

.table-card-actions button:hover {
  background: #f0fdfa;
}

.empty-table-text {
  text-align: center;
  color: #64748b !important;
  padding: 32px !important;
}

.card-pagination,
.card-bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.card-bulk-bar {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.card-bulk-bar span {
  font-weight: 900;
  color: #0f172a;
}

.top-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 1200px) {
  .quick-card-actions,
  .library-card-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .id-card-body {
    grid-template-columns: 90px 1fr;
  }

  .qr-code {
    display: none;
  }
}

@media (max-width: 700px) {
  .quick-card-actions,
  .library-card-stats {
    grid-template-columns: 1fr;
  }

  .id-card-body {
    grid-template-columns: 1fr;
  }

  .top-actions {
    width: 100%;
    flex-direction: column;
  }
}

/* ================= CSS CỦA TRANG BÁO CÁO ================= */
.report-panel, .report-kpi-card { border: 1px solid #e2e8f0; border-radius: 18px !important; background: white; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02); padding: 20px; }
.filter-label { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

.report-kpi-card { min-height: 140px; display: flex; justify-content: center; align-items: center; transition: 0.2s; }
.report-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(13, 148, 136, 0.1); }
.kpi-title { font-size: 13px; font-weight: 850; color: #334155; margin-bottom: 4px; }
.kpi-value { font-size: 26px; font-weight: 950; color: #0f172a; margin-bottom: 4px; }
.kpi-trend { font-size: 12px; font-weight: 800; color: #0d9488; }

.panel-title { margin: 0; font-size: 17px; font-weight: 950; color: #0f172a; }
.custom-select :deep(.v-field__input) { min-height: 34px !important; padding-top: 0; padding-bottom: 0; font-size: 13px; font-weight: 700; color: #475569; }

/* SVG AREA CHART */
.svg-chart-container { height: 260px; display: flex; align-items: flex-end; padding-top: 10px; }
.y-axis-labels { display: flex; flex-direction: column; justify-content: space-between; height: 240px; padding-right: 12px; font-size: 11px; font-weight: 700; color: #94a3b8; }
.svg-wrapper { flex-grow: 1; height: 260px; position: relative; }
.x-axis-labels { display: flex; justify-content: space-between; padding-top: 10px; font-size: 11px; font-weight: 700; color: #94a3b8; margin-left: -10px; margin-right: -10px; }

.legend-area span { display: inline-flex; align-items: center; font-size: 12px; font-weight: 800; color: #475569; }
.legend-area i { width: 14px; height: 10px; border-radius: 3px; margin-right: 6px; }

/* DONUT CHART (CSS PURE) */
.new-donut { width: 180px; height: 180px; border-radius: 50%; background: conic-gradient( #0d9488 0 28%, #2563eb 28% 50%, #f97316 50% 68%, #a855f7 68% 83%, #ef4444 83% 93%, #9ca3af 93% 100% ); display: grid; place-items: center; }
.new-donut-hole { width: 100px; height: 100px; border-radius: 50%; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.new-donut-hole strong { font-size: 24px; font-weight: 950; line-height: 1; color: #0f172a; }
.new-donut-hole span { font-size: 12px; font-weight: 700; color: #64748b; margin-top: 4px; }
.donut-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }

/* PROGRESS BARS */
.progress-list { width: 100%; }
.progress-track { height: 10px; border-radius: 999px; background: #e2e8f0; overflow: hidden; width: 100%; }
.progress-fill { height: 100%; background: #0d9488; border-radius: 999px; }

/* TABLE BÁO CÁO */
.report-table :deep(th) { border-bottom: 1px solid #e2e8f0 !important; background-color: transparent !important; font-weight: 800 !important; color: #64748b !important; }
.report-table :deep(td) { border-bottom: 1px solid #f1f5f9 !important; padding: 10px 0 !important; }

/* TERMINAL LOG */
.terminal-log { background: #0f172a; color: #10b981; border-radius: 12px; padding: 16px; font-family: monospace !important; font-size: 13px; line-height: 1.6; height: 140px; overflow-y: auto; }

/* IN ẨN SIDEBAR */
@media print {
  .sidebar, .v-app-bar, .terminal-log, button { display: none !important; }
  .main-scroll { height: auto !important; overflow: visible !important; }
  .report-section { background: white !important; }
}

/* ===================== SETTINGS PAGE ===================== */

.settings-page {
  padding-bottom: 28px;
}

.settings-tabs-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  min-height: 70px;
  border: 1px solid #e5e7eb !important;
  border-radius: 18px !important;
  background: #ffffff;
  margin-bottom: 18px;
  overflow-x: auto;
}

.setting-tab {
  height: 70px;
  min-width: 180px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 850;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 3px solid transparent;
}

.setting-tab.active {
  color: #0d9488;
  border-bottom-color: #0d9488;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: 18px;
}

.setting-card {
  background: white;
  border: 1px solid #e5e7eb !important;
  border-radius: 18px !important;
  padding: 22px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}

.setting-card.full-card {
  width: 100%;
}

.setting-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.setting-card-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
  color: #111827;
}

.row-between {
  justify-content: space-between;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: grid;
  gap: 7px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 850;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea,
.input-with-unit input,
.color-input input,
.log-filter input,
.log-filter select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  min-height: 44px;
  padding: 0 12px;
  outline: none;
  background: white;
  color: #111827;
}

.form-group textarea {
  padding: 12px;
  resize: vertical;
}

.input-with-unit {
  display: grid;
  grid-template-columns: 1fr 82px;
}

.input-with-unit input {
  border-radius: 10px 0 0 10px;
}

.input-with-unit span {
  min-height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid #d1d5db;
  border-left: none;
  border-radius: 0 10px 10px 0;
  color: #334155;
  background: #f8fafc;
  font-weight: 700;
}

.switch-list {
  display: grid;
  gap: 12px;
}

.switch-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.switch-row span {
  color: #111827;
  font-weight: 700;
}

.checkbox-list {
  display: grid;
  gap: 16px;
}

.checkbox-list label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-weight: 700;
}

.checkbox-list input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #0d9488;
}

.inline-setting {
  display: grid;
  grid-template-columns: 1fr 70px 50px;
  gap: 8px;
  align-items: center;
  margin-left: 30px;
}

.inline-setting input {
  height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  text-align: center;
}

.color-input {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 10px;
}

.color-input input[type='color'] {
  padding: 4px;
}

.save-setting-btn,
.outline-setting-btn {
  min-height: 42px;
  border-radius: 10px;
  padding: 0 18px;
  cursor: pointer;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.save-setting-btn {
  border: none;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: white;
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.22);
}

.outline-setting-btn {
  border: 1px solid #0d9488;
  background: white;
  color: #0d9488;
}

.save-setting-btn.small,
.outline-setting-btn.small {
  min-height: 38px;
  font-size: 13px;
}

.setting-note {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 22px;
}

.setting-table {
  width: 100%;
  border-collapse: collapse;
}

.setting-table th {
  text-align: left;
  padding: 14px 12px;
  background: #f8fafc;
  font-weight: 950;
  color: #0f172a;
  border-bottom: 1px solid #e5e7eb;
}

.setting-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.account-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-cell strong {
  display: block;
  font-weight: 950;
}

.account-cell span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.role-chip,
.account-status {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
}

.role-chip {
  background: #e0f2fe;
  color: #0369a1;
}

.account-status {
  background: #dcfce7;
  color: #16a34a;
}

.account-status.locked {
  background: #fee2e2;
  color: #ef4444;
}

.setting-actions {
  display: flex;
  gap: 8px;
}

.setting-actions button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 9px;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
}

.setting-actions button.danger {
  color: #ef4444;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.role-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
  background: #f8fafc;
}

.role-card h4 {
  margin: 0 0 6px;
  font-weight: 950;
}

.role-card p {
  margin: 0 0 14px;
  color: #64748b;
}

.role-card label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-weight: 700;
}

.role-card input {
  accent-color: #0d9488;
}

.file-input {
  width: 100%;
  border: 1px dashed #0d9488;
  border-radius: 12px;
  padding: 18px;
  background: #f0fdfa;
}

.outline-mini-btn {
  height: 32px;
  border: 1px solid #0d9488;
  border-radius: 8px;
  background: white;
  color: #0d9488;
  cursor: pointer;
  font-weight: 850;
  padding: 0 12px;
}

.log-filter {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.system-log-box {
  background: #111827;
  color: #d1fae5;
  border-radius: 12px;
  padding: 16px;
  max-height: 420px;
  overflow-y: auto;
  font-family: Consolas, monospace !important;
}

.log-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.log-row span {
  font-weight: 950;
}

.log-row.info span {
  color: #86efac;
}

.log-row.warn span {
  color: #fbbf24;
}

.log-row.error span {
  color: #f87171;
}

.log-row b {
  color: #93c5fd;
  min-width: 145px;
}

.log-row p {
  margin: 0;
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.dialog-head h3 {
  margin: 0;
  font-weight: 950;
}

@media (max-width: 1200px) {
  .settings-grid,
  .role-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 800px) {
  .settings-grid,
  .role-grid,
  .form-row,
  .log-filter {
    grid-template-columns: 1fr;
  }

  .setting-tab {
    min-width: 150px;
  }

  .setting-table {
    min-width: 850px;
  }

  .setting-card.full-card {
    overflow-x: auto;
  }
}


/* ===================== OVERVIEW V3 ===================== */

.overview-v3 {
  padding-bottom: 28px;
}

.overview-kpi-card,
.overview-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.overview-kpi-card {
  min-height: 118px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.overview-kpi-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.overview-kpi-info p {
  margin: 0 0 6px;
  color: #475569;
  font-size: 14px;
  font-weight: 900;
}

.overview-kpi-info h2 {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 950;
}

.overview-kpi-info span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 800;
}

.overview-kpi-info span.down {
  color: #ef4444;
}

.overview-panel {
  height: 100%;
  padding: 22px;
}

.overview-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.overview-panel-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
}

.overview-small-select {
  height: 38px;
  min-width: 118px;
  border: 1px solid #dbe4ea;
  border-radius: 10px;
  background: white;
  padding: 0 12px;
  color: #334155;
  font-weight: 800;
  outline: none;
}

.overview-text-link {
  border: none;
  background: transparent;
  color: #0d9488;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
}

.overview-line-chart {
  height: 310px;
  position: relative;
  padding-bottom: 36px;
}

.overview-line-chart svg {
  width: 100%;
  height: 270px;
  overflow: visible;
}

.overview-x-labels {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  display: flex;
  justify-content: space-between;
  padding: 0 15px;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
}

.overview-chart-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  color: #475569;
  font-size: 13px;
  font-weight: 850;
  margin-top: 6px;
}

.overview-chart-legend i {
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 7px;
  border-radius: 50%;
}

.overview-chart-legend .borrow {
  background: #0d9488;
}

.overview-chart-legend .return {
  background: #2563eb;
}

.overview-status-panel {
  display: flex;
  flex-direction: column;
}

.overview-donut-wrap {
  flex: 1;
  display: grid;
  place-items: center;
}

.overview-donut {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
}

.overview-donut-hole {
  width: 105px;
  height: 105px;
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  text-align: center;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.overview-donut-hole span {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
  margin-top: 14px;
}

.overview-donut-hole strong {
  color: #0f172a;
  font-size: 34px;
  font-weight: 950;
  margin-top: -18px;
}

.overview-donut-list {
  width: 100%;
  display: grid;
  gap: 14px;
  margin-top: 26px;
}

.overview-donut-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
}

.overview-donut-list span {
  display: flex;
  align-items: center;
  gap: 9px;
}

.overview-donut-list i {
  width: 13px;
  height: 13px;
  border-radius: 4px;
}

.overview-link-btn {
  height: 43px;
  border: 1px solid #dbe4ea;
  border-radius: 12px;
  background: white;
  color: #0d9488;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 18px;
}

.overview-link-btn:hover {
  border-color: #0d9488;
  background: #f0fdfa;
}

.overview-alert-list {
  display: grid;
  gap: 14px;
}

.overview-alert-item {
  min-height: 58px;
  display: flex;
  align-items: center;
  padding-bottom: 13px;
  border-bottom: 1px solid #f1f5f9;
}

.overview-alert-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.overview-alert-item strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
}

.overview-alert-item span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-top: 3px;
}

.overview-alert-item b {
  border-radius: 999px;
  padding: 7px 11px;
  color: #ef4444;
  background: #fee2e2;
  font-size: 12px;
  white-space: nowrap;
}

.lower-panel {
  min-height: 390px;
}

.overview-book-list {
  display: grid;
  gap: 12px;
}

.overview-book-row {
  display: grid;
  grid-template-columns: 30px 42px 1fr 34px;
  gap: 12px;
  align-items: center;
}

.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: white;
  font-size: 12px;
  font-weight: 950;
  background: #64748b;
}

.rank-1 { background: #f97316; }
.rank-2 { background: #3b82f6; }
.rank-3 { background: #f59e0b; }
.rank-4 { background: #0d9488; }
.rank-5 { background: #14b8a6; }

.overview-book-row img {
  width: 42px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.overview-book-row strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
}

.overview-book-row span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-top: 2px;
}

.overview-book-row b {
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
}

.book-progress,
.category-progress {
  height: 7px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
  margin-top: 8px;
}

.book-progress i,
.category-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.overview-category-list {
  display: grid;
  gap: 20px;
}

.category-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 9px;
}

.category-head strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
}

.category-head span {
  color: #475569;
  font-size: 13px;
  font-weight: 850;
}

.overview-category-list small {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.overview-timeline {
  display: grid;
  gap: 0;
  margin-bottom: 22px;
}

.overview-timeline > div {
  display: grid;
  grid-template-columns: 46px 18px 1fr;
  gap: 12px;
  position: relative;
  padding-bottom: 17px;
}

.overview-timeline > div:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 54px;
  top: 15px;
  bottom: 0;
  width: 2px;
  background: #dbe4ea;
}

.overview-timeline > div > span {
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
  text-align: right;
  padding-top: 2px;
}

.overview-timeline > div > i {
  width: 11px;
  height: 11px;
  margin-top: 4px;
  border-radius: 50%;
  background: #0d9488;
  border: 3px solid #ccfbf1;
  position: relative;
  z-index: 2;
}

.overview-timeline strong {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.overview-timeline p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.overview-quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 11px;
}

.overview-quick-actions button {
  min-height: 84px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  cursor: pointer;
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 12px 8px;
  transition: 0.2s;
}

.overview-quick-actions button:hover {
  transform: translateY(-3px);
  border-color: #99f6e4;
  box-shadow: 0 12px 26px rgba(13, 148, 136, 0.12);
}

.overview-quick-actions span {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.overview-quick-actions b {
  color: #0f172a;
  font-size: 12px;
  font-weight: 950;
  text-align: center;
}

@media (max-width: 1280px) {
  .overview-line-chart {
    height: 280px;
  }

  .overview-quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .overview-kpi-card {
    align-items: flex-start;
  }

  .overview-panel-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .overview-book-row {
    grid-template-columns: 28px 38px 1fr;
  }

  .overview-book-row > b {
    display: none;
  }

  .overview-quick-actions {
    grid-template-columns: 1fr;
  }
}




/* =========================================================
   FIX FONT + GIAO DIỆN TỔNG QUAN GIỐNG ẢNH MẪU
   Dán cuối <style scoped> hoặc dùng file đã sửa.
========================================================= */

:global(body),
:global(.v-application) {
  font-family: "Inter", "Segoe UI", Arial, sans-serif !important;
  background: #f5f7fb !important;
  color: #0f172a !important;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

/* Sidebar chữ rõ, màu giống ảnh */
:deep(.v-navigation-drawer) {
  background:
    radial-gradient(circle at 10% 0%, rgba(45, 212, 191, 0.22), transparent 34%),
    linear-gradient(180deg, #064e40 0%, #06493d 48%, #053d35 100%) !important;
  box-shadow: 16px 0 40px rgba(6, 78, 64, 0.08);
}

:deep(.v-navigation-drawer .v-list-item) {
  min-height: 48px !important;
  margin-bottom: 10px !important;
  border-radius: 12px !important;
}

:deep(.v-navigation-drawer .v-list-item-title) {
  font-size: 15px !important;
  font-weight: 800 !important;
  letter-spacing: -0.15px !important;
  color: #d1fae5 !important;
}

.active-menu-item {
  background: linear-gradient(135deg, #0d9488, #14b8a6) !important;
  box-shadow: 0 14px 28px rgba(13, 148, 136, 0.26);
}

.active-menu-item :deep(.v-list-item-title),
.active-menu-item :deep(.v-icon) {
  color: #ffffff !important;
}

.user-profile-box {
  min-height: 76px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
}

/* Header giống ảnh */
:deep(.v-app-bar) {
  background: #f5f7fb !important;
  border-bottom: none !important;
}

:deep(.v-app-bar h2) {
  font-size: 28px !important;
  font-weight: 900 !important;
  letter-spacing: -0.8px !important;
  color: #111827 !important;
}

:deep(.v-app-bar .text-caption) {
  font-size: 15px !important;
  font-weight: 700 !important;
}

.search-input {
  width: 300px !important;
}

.search-input :deep(.v-field) {
  min-height: 48px !important;
  border-radius: 999px !important;
  background: #ffffff !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
}

.search-input :deep(input) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #334155 !important;
}

/* Tổng quan: khung chữ, khoảng cách và card */
.overview-v3 {
  padding: 8px 0 30px;
}

.overview-kpi-row {
  margin-bottom: 18px !important;
}

.overview-kpi-card,
.overview-panel {
  background: #ffffff !important;
  border: 1px solid #e3e8ef !important;
  border-radius: 18px !important;
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
}

.overview-kpi-card {
  min-height: 128px !important;
  padding: 24px 26px !important;
  gap: 20px !important;
}

.overview-kpi-icon {
  width: 70px !important;
  height: 70px !important;
  border-radius: 50% !important;
}

.overview-kpi-info p {
  margin: 0 0 9px !important;
  color: #111827 !important;
  font-size: 15px !important;
  line-height: 1.2 !important;
  font-weight: 800 !important;
  letter-spacing: -0.25px !important;
}

.overview-kpi-info h2 {
  margin: 0 !important;
  font-size: 33px !important;
  line-height: 1.05 !important;
  font-weight: 900 !important;
  letter-spacing: -0.9px !important;
}

.overview-kpi-info span {
  margin-top: 9px !important;
  color: #16a34a !important;
  font-size: 13px !important;
  line-height: 1.25 !important;
  font-weight: 750 !important;
}

.overview-kpi-info span.down {
  color: #ef4444 !important;
}

/* Panel title */
.overview-panel {
  padding: 23px 24px !important;
}

.overview-panel-head {
  margin-bottom: 18px !important;
}

.overview-panel-head h3 {
  color: #111827 !important;
  font-size: 20px !important;
  line-height: 1.3 !important;
  font-weight: 900 !important;
  letter-spacing: -0.45px !important;
}

.overview-text-link,
.overview-link-btn {
  color: #0d9488 !important;
  font-size: 14px !important;
  font-weight: 850 !important;
}

/* Biểu đồ lớn */
.overview-line-chart {
  height: 330px !important;
  padding: 8px 8px 38px !important;
}

.overview-line-chart svg {
  height: 280px !important;
}

.overview-line-chart text {
  font-family: "Inter", "Segoe UI", Arial, sans-serif !important;
  font-size: 17px !important;
  font-weight: 900 !important;
}

.overview-x-labels {
  padding: 0 22px !important;
  color: #0f172a !important;
  font-size: 14px !important;
  font-weight: 750 !important;
}

.overview-chart-legend {
  gap: 28px !important;
  color: #111827 !important;
  font-size: 15px !important;
  font-weight: 750 !important;
}

/* Donut */
.overview-donut {
  width: 180px !important;
  height: 180px !important;
  filter: drop-shadow(0 18px 28px rgba(13, 148, 136, 0.16));
}

.overview-donut-hole {
  width: 106px !important;
  height: 106px !important;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.09) !important;
}

.overview-donut-hole span {
  color: #111827 !important;
  font-size: 15px !important;
  font-weight: 800 !important;
}

.overview-donut-hole strong {
  color: #111827 !important;
  font-size: 33px !important;
  font-weight: 900 !important;
}

.overview-donut-list div {
  color: #111827 !important;
  font-size: 15px !important;
  font-weight: 750 !important;
}

.overview-donut-list b {
  color: #111827 !important;
  font-weight: 850 !important;
}

/* Danh sách cảnh báo */
.overview-alert-item {
  min-height: 66px !important;
  padding: 8px 0 14px !important;
}

.overview-alert-item strong {
  color: #111827 !important;
  font-size: 15px !important;
  line-height: 1.2 !important;
  font-weight: 900 !important;
  letter-spacing: -0.2px !important;
}

.overview-alert-item span {
  color: #64748b !important;
  font-size: 14px !important;
  font-weight: 650 !important;
}

.overview-alert-item b {
  font-size: 13px !important;
  font-weight: 850 !important;
  padding: 8px 12px !important;
}

/* Lower cards */
.lower-panel {
  min-height: 390px !important;
}

.overview-book-row {
  grid-template-columns: 30px 45px 1fr 45px !important;
  gap: 13px !important;
  padding: 4px 0 !important;
}

.overview-book-row img {
  width: 45px !important;
  height: 58px !important;
  border-radius: 7px !important;
}

.overview-book-row strong,
.category-head strong,
.overview-timeline strong {
  color: #111827 !important;
  font-size: 15px !important;
  line-height: 1.25 !important;
  font-weight: 900 !important;
  letter-spacing: -0.2px !important;
}

.overview-book-row span,
.overview-timeline p {
  color: #64748b !important;
  font-size: 13px !important;
  line-height: 1.35 !important;
  font-weight: 650 !important;
}

.overview-book-row b {
  color: #111827 !important;
  font-size: 16px !important;
  font-weight: 900 !important;
}

.category-head span,
.overview-category-list small {
  color: #64748b !important;
  font-size: 13px !important;
  font-weight: 750 !important;
}

.category-progress,
.book-progress {
  height: 8px !important;
  background: #e8edf3 !important;
}

.overview-timeline > div > span {
  color: #64748b !important;
  font-size: 14px !important;
  font-weight: 750 !important;
}

.overview-timeline > div > i {
  background: #0d9488 !important;
  border-color: #ccfbf1 !important;
}

.overview-quick-actions button {
  background: #f8fafc !important;
  border: 1px solid #e3e8ef !important;
  border-radius: 14px !important;
}

.overview-quick-actions b {
  color: #111827 !important;
  font-size: 13px !important;
  line-height: 1.25 !important;
  font-weight: 850 !important;
}

/* Vuetify text helper chỉnh nhẹ để đồng bộ font */
:deep(.text-caption) {
  letter-spacing: 0 !important;
}

:deep(.font-weight-bold) {
  font-weight: 800 !important;
}

@media (max-width: 1280px) {
  .search-input {
    width: 250px !important;
  }

  .overview-kpi-info h2 {
    font-size: 29px !important;
  }

  .overview-panel-head h3 {
    font-size: 18px !important;
  }
}



/* ===================== HEADER SEARCH / NOTIFICATION / AVATAR ACTIONS ===================== */
.dashboard-header-actions {
  gap: 0;
}

.quick-search-wrap {
  display: flex;
  align-items: center;
}

.quick-search-menu,
.notification-menu-card,
.account-menu-card {
  border-radius: 18px !important;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: white;
}

.quick-search-menu {
  width: 390px;
  padding: 12px;
}

.search-menu-head,
.notification-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 8px 12px;
}

.search-menu-head strong,
.notification-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
}

.search-menu-head span,
.notification-head p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.search-result-list,
.notification-list {
  display: grid;
  gap: 7px;
  max-height: 390px;
  overflow-y: auto;
}

.search-result-item,
.notification-item {
  width: 100%;
  border: none;
  border-radius: 13px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px;
  text-align: left;
  transition: 0.18s ease;
}

.search-result-item:hover,
.notification-item:hover {
  background: #f8fafc;
}

.search-result-item > span,
.noti-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.search-result-item strong,
.notification-item strong {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
  line-height: 1.25;
}

.search-result-item small,
.notification-item p {
  display: block;
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 600;
}

.notification-item small {
  display: block;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}

.notification-item.unread {
  background: #f0fdfa;
}

.notification-item.unread strong::after {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-left: 7px;
  border-radius: 50%;
  background: #ef4444;
  vertical-align: middle;
}

.search-empty-state {
  padding: 28px 18px;
  text-align: center;
  color: #64748b;
}

.search-empty-state p {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 700;
}

.notification-menu-card {
  width: 420px;
}

.notification-head {
  padding: 16px 16px 12px;
}

.notification-head button,
.notification-footer {
  border: none;
  background: transparent;
  color: #0d9488;
  cursor: pointer;
  font-size: 12px;
  font-weight: 950;
}

.notification-footer {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.notification-btn:hover,
.avatar-menu-btn:hover {
  background: #f0fdfa !important;
}

.avatar-menu-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 4px;
  border-radius: 999px;
  transition: 0.18s ease;
}

.account-menu-card {
  width: 300px;
  padding: 10px;
}

.account-menu-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
}

.account-menu-head h4 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
}

.account-menu-head p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.account-menu-item {
  width: 100%;
  min-height: 42px;
  border: none;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  color: #334155;
  font-size: 13px;
  font-weight: 850;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  margin: 5px 0;
  transition: 0.18s ease;
}

.account-menu-item:hover {
  background: #f8fafc;
  color: #0d9488;
}

.account-menu-item.logout {
  color: #ef4444;
}

.account-menu-item.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

.sidebar-user-btn {
  width: 100%;
  min-height: 58px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  transition: 0.18s ease;
}

.sidebar-user-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.sidebar-user-text {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.sidebar-user-text strong {
  display: block;
  color: white;
  font-size: 14px;
  font-weight: 950;
  line-height: 1.1;
}

.sidebar-user-text span {
  display: block;
  margin-top: 4px;
  color: #99f6e4;
  font-size: 11px;
  font-weight: 700;
}

.profile-dialog-card {
  border-radius: 24px !important;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: white;
}

.profile-dialog-cover {
  height: 118px;
  background:
    radial-gradient(circle at 15% 40%, rgba(45, 212, 191, 0.28), transparent 24%),
    linear-gradient(135deg, #064e40, #0d9488);
}

.profile-dialog-body {
  padding: 0 28px 28px;
}

.profile-dialog-head {
  display: flex;
  align-items: end;
  gap: 18px;
  margin-top: -48px;
}

.profile-dialog-avatar {
  border: 5px solid white;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.profile-dialog-head h2 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
}

.profile-dialog-head p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.profile-info-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.profile-info-grid div {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.profile-info-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 5px;
}

.profile-info-grid strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.profile-dialog-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .quick-search-menu,
  .notification-menu-card,
  .account-menu-card {
    width: calc(100vw - 32px);
  }

  .profile-info-grid {
    grid-template-columns: 1fr;
  }
}


/* ===================== NOTIFICATION CENTER V2 ===================== */

.admin-head-avatar {
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.18);
}

.notification-v2-page {
  padding: 18px 0 28px;
}

.notification-hero-v2 {
  min-height: 142px;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
  display: grid;
  grid-template-columns: 210px 1fr 280px;
  align-items: center;
  gap: 24px;
  padding: 24px 34px;
  margin-bottom: 18px;
  overflow: hidden;
  position: relative;
}

.bell-illustration-v2 {
  height: 110px;
  display: grid;
  place-items: center;
  position: relative;
}

.bell-circle-v2 {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #0d9488;
  background:
    radial-gradient(circle at 30% 20%, rgba(255,255,255,.9), transparent 38%),
    linear-gradient(135deg, #ccfbf1, #99f6e4);
  box-shadow: 0 18px 34px rgba(13, 148, 136, 0.16);
}

.spark {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: #14b8a6;
  transform: rotate(45deg);
}

.spark.s1 { left: 28px; top: 22px; }
.spark.s2 { right: 28px; top: 34px; background: #fbbf24; }
.spark.s3 { right: 52px; bottom: 16px; background: #0d9488; }

.notification-hero-content-v2 {
  border-left: 1px dashed #cbd5e1;
  padding-left: 34px;
}

.notification-hero-content-v2 h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 950;
  color: #0f172a;
}

.notification-hero-content-v2 p {
  margin: 0;
  color: #64748b;
  line-height: 1.65;
  font-weight: 650;
}

.notification-hero-side-v2 {
  border-left: 1px dashed #cbd5e1;
  padding-left: 28px;
  display: grid;
  gap: 14px;
}

.notification-hero-side-v2 > div {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 0 10px;
  color: #64748b;
}

.notification-hero-side-v2 strong {
  grid-column: 2;
  color: #0f172a;
  font-weight: 900;
}

.auto-refresh-toggle-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: #475569;
  font-weight: 800;
  cursor: pointer;
}

.auto-refresh-toggle-v2 input {
  display: none;
}

.auto-refresh-toggle-v2 i {
  width: 46px;
  height: 24px;
  border-radius: 999px;
  background: #cbd5e1;
  position: relative;
  transition: 0.2s;
}

.auto-refresh-toggle-v2 i::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: 0.2s;
}

.auto-refresh-toggle-v2 input:checked + i {
  background: #0d9488;
}

.auto-refresh-toggle-v2 input:checked + i::after {
  left: 24px;
}

.notification-stat-grid-v2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.notification-stat-card-v2 {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  min-height: 104px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  transition: 0.2s;
}

.notification-stat-card-v2:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 42px rgba(13, 148, 136, 0.1);
  border-color: #99f6e4;
}

.notification-stat-card-v2 .stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.notification-stat-card-v2 .stat-icon.blue { color: #2563eb; background: #dbeafe; }
.notification-stat-card-v2 .stat-icon.red { color: #ef4444; background: #fee2e2; }
.notification-stat-card-v2 .stat-icon.teal { color: #0d9488; background: #ccfbf1; }
.notification-stat-card-v2 .stat-icon.green { color: #16a34a; background: #dcfce7; }

.notification-stat-card-v2 p {
  margin: 0;
  color: #64748b;
  font-weight: 850;
}

.notification-stat-card-v2 h3 {
  margin: 4px 0;
  color: #0f172a;
  font-size: 28px;
  font-weight: 950;
}

.notification-stat-card-v2 small {
  color: #64748b;
  font-weight: 650;
}

.notification-layout-v2 {
  display: grid;
  grid-template-columns: 1.55fr 0.85fr;
  gap: 18px;
}

.notification-left-v2,
.notification-detail-card-v2,
.activity-card-v2 {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: white;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
}

.notification-toolbar-v2 {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-tabs-v2 {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.notification-tabs-v2 button {
  height: 38px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  font-weight: 850;
  cursor: pointer;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.notification-tabs-v2 button.active {
  border-color: #0d9488;
  color: #0d9488;
  background: #f0fdfa;
}

.notification-tabs-v2 b {
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  display: grid;
  place-items: center;
  font-size: 11px;
}

.notification-filter-v2 {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 12px;
}

.notification-search-v2 {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: #64748b;
}

.notification-search-v2 input,
.notification-filter-v2 select {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  height: 100%;
  color: #0f172a;
  font-weight: 700;
}

.notification-filter-v2 select {
  border: 1px solid #d1d5db;
  border-radius: 9px;
  padding: 0 12px;
  background: white;
}

.notification-action-bar-v2 {
  min-height: 56px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.notification-action-bar-v2 > div:first-child {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-weight: 950;
}

.notification-actions-v2 {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-actions-v2 button {
  height: 34px;
  border: 1px solid #0d9488;
  border-radius: 8px;
  background: white;
  color: #0d9488;
  padding: 0 10px;
  cursor: pointer;
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.notification-actions-v2 button.danger {
  border-color: #ef4444;
  color: #ef4444;
}

.notification-actions-v2 button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.notification-list-v2 {
  padding: 10px 16px;
}

.notification-row-v2 {
  min-height: 82px;
  display: grid;
  grid-template-columns: 22px 10px 54px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  border-bottom: 1px solid #eef2f7;
  cursor: pointer;
  transition: 0.2s;
}

.notification-row-v2:hover,
.notification-row-v2.active {
  background: #f0fdfa;
}

.notification-row-v2.unread {
  background: linear-gradient(90deg, rgba(13, 148, 136, 0.1), rgba(255,255,255,0.6));
}

.read-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
}

.read-dot.read {
  background: #cbd5e1;
}

.notification-icon-v2 {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.notification-main-v2 > div:first-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.notification-main-v2 h4 {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
}

.notification-time-v2 {
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
  font-weight: 650;
}

.notification-main-v2 p {
  margin: 4px 0 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.notification-meta-v2 {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-meta-v2 span {
  border-radius: 999px;
  padding: 4px 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 850;
}

.notification-meta-v2 .priority.high { color: #ef4444; background: #fee2e2; }
.notification-meta-v2 .priority.medium { color: #f97316; background: #ffedd5; }
.notification-meta-v2 .priority.low { color: #0d9488; background: #ccfbf1; }

.notification-status-chip-v2 {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.notification-status-chip-v2.done {
  background: #dcfce7;
  color: #16a34a;
}

.notification-status-chip-v2.pending {
  background: #fff7ed;
  color: #f97316;
}

.notification-empty-v2 {
  min-height: 260px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #64748b;
}

.notification-empty-v2 h3 {
  margin: 8px 0 0;
  color: #334155;
}

.notification-pagination-v2 {
  min-height: 56px;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.notification-pagination-v2 div {
  display: flex;
  gap: 6px;
}

.notification-pagination-v2 button {
  min-width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 850;
}

.notification-pagination-v2 button.active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}

.notification-pagination-v2 button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.notification-right-v2 {
  display: grid;
  gap: 18px;
  align-content: start;
}

.notification-detail-card-v2,
.activity-card-v2 {
  padding: 18px;
}

.detail-head-v2,
.activity-head-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-head-v2 h3,
.activity-head-v2 h3 {
  margin: 0;
  color: #0f172a;
  font-size: 17px;
  font-weight: 950;
}

.detail-head-v2 button,
.activity-head-v2 button {
  border: none;
  background: transparent;
  color: #0d9488;
  font-weight: 900;
  cursor: pointer;
}

.detail-title-v2 {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.detail-title-v2 > span {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.detail-title-v2 h4 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 950;
}

.detail-title-v2 p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.priority-text.high { color: #ef4444; }
.priority-text.medium { color: #f97316; }
.priority-text.low { color: #0d9488; }

.detail-message-v2 {
  color: #475569;
  line-height: 1.7;
  font-size: 14px;
  margin-bottom: 16px;
}

.reader-normal-box-v2 {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 16px;
}

.normal-person-avatar-v2 {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #0d9488;
  background: #ccfbf1;
  flex-shrink: 0;
}

.reader-normal-box-v2 strong {
  color: #0f172a;
  font-weight: 950;
}

.reader-normal-box-v2 p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.detail-info-grid-v2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.detail-info-grid-v2 div {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.detail-info-grid-v2 span {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 4px;
}

.detail-info-grid-v2 strong {
  color: #0f172a;
  font-size: 13px;
}

.detail-actions-v2 {
  display: grid;
  grid-template-columns: 1fr 1fr 0.65fr;
  gap: 10px;
}

.detail-actions-v2 button {
  height: 40px;
  border: 1px solid #0d9488;
  border-radius: 9px;
  background: white;
  color: #0d9488;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.detail-actions-v2 button:nth-child(2) {
  background: #0d9488;
  color: white;
}

.detail-actions-v2 button.danger {
  border-color: #ef4444;
  color: #ef4444;
}

.detail-empty-v2 {
  min-height: 280px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #64748b;
}

.activity-list-v2 {
  display: grid;
  gap: 12px;
}

.activity-item-v2 {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  position: relative;
}

.activity-item-v2:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 16px;
  top: 36px;
  bottom: -10px;
  width: 2px;
  background: #e5e7eb;
}

.activity-item-v2 > span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: white;
  display: grid;
  place-items: center;
  z-index: 2;
}

.activity-item-v2 b {
  color: #64748b;
  font-size: 12px;
}

.activity-item-v2 h4 {
  margin: 2px 0 2px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.activity-item-v2 p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.notification-dialog-v2 {
  padding: 24px;
  border-radius: 18px !important;
}

.dialog-head-v2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.dialog-head-v2 h3 {
  margin: 0;
  color: #0f172a;
  font-weight: 950;
}

.dialog-actions-v2 {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 1400px) {
  .notification-hero-v2 {
    grid-template-columns: 160px 1fr;
  }

  .notification-hero-side-v2 {
    grid-column: 1 / -1;
    border-left: 0;
    border-top: 1px dashed #cbd5e1;
    padding-left: 0;
    padding-top: 18px;
  }

  .notification-layout-v2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .notification-hero-v2,
  .notification-stat-grid-v2,
  .notification-filter-v2 {
    grid-template-columns: 1fr;
  }

  .notification-hero-content-v2 {
    border-left: 0;
    padding-left: 0;
  }

  .notification-row-v2 {
    grid-template-columns: 22px 10px 48px 1fr;
  }

  .notification-status-chip-v2 {
    grid-column: 4;
    justify-self: start;
  }

  .notification-pagination-v2,
  .notification-action-bar-v2 {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-actions-v2,
  .detail-info-grid-v2 {
    grid-template-columns: 1fr;
  }
}


/* ================= QUẢN LÝ SÁCH - CATALOG INLINE ================= */
.catalog-inline-page {
  color: #0f172a;
  padding-bottom: 28px;
}

.catalog-inline-hero {
  min-height: 236px;
  border-radius: 24px;
  padding: 34px 38px;
  background:
    radial-gradient(circle at 72% 10%, rgba(45, 212, 191, 0.2), transparent 28%),
    linear-gradient(135deg, #064e3b 0%, #0f766e 58%, #0d9488 100%);
  box-shadow: 0 22px 44px rgba(13, 148, 136, 0.16);
  overflow: hidden;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  align-items: center;
  gap: 24px;
}

.catalog-hero-chip {
  width: max-content;
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.14);
  color: #ccfbf1;
  font-size: 13px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 8px;
}

.catalog-inline-hero h1 {
  margin: 18px 0 12px;
  color: white;
  font-size: 38px;
  line-height: 1.12;
  font-weight: 950;
}

.catalog-inline-hero p {
  max-width: 720px;
  color: #e0fdfa;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 700;
  margin: 0 0 24px;
}

.catalog-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.catalog-add-btn,
.catalog-reload-btn {
  height: 48px;
  border-radius: 14px;
  border: none;
  padding: 0 18px;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.catalog-add-btn {
  background: white;
  color: #0f766e;
}

.catalog-reload-btn {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.catalog-hero-art {
  min-height: 190px;
  position: relative;
}

.catalog-art-book-stack {
  position: absolute;
  right: 38px;
  bottom: 38px;
  width: 210px;
  display: grid;
  gap: 9px;
  transform: rotate(-1deg);
}

.catalog-art-book-stack i {
  height: 30px;
  border-radius: 999px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.16);
}

.catalog-art-book-stack i:nth-child(1) {
  background: #0f766e;
}

.catalog-art-book-stack i:nth-child(2) {
  background: #14b8a6;
}

.catalog-art-book-stack i:nth-child(3) {
  background: #99f6e4;
}

.catalog-art-book-stack i:nth-child(4) {
  background: #0d9488;
}

.catalog-art-open-book {
  position: absolute;
  right: 180px;
  bottom: 14px;
  width: 190px;
  height: 54px;
  border-radius: 50% 50% 12px 12px;
  border-bottom: 18px solid rgba(204, 251, 241, 0.6);
  transform: rotate(-6deg);
}

.catalog-kpi-grid {
  margin: 18px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.catalog-kpi-card {
  min-height: 112px;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.catalog-kpi-card > span {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
}

.catalog-kpi-card.green > span {
  background: #dcfce7;
  color: #0f766e;
}

.catalog-kpi-card.blue > span {
  background: #dbeafe;
  color: #2563eb;
}

.catalog-kpi-card.orange > span {
  background: #ffedd5;
  color: #f59e0b;
}

.catalog-kpi-card.purple > span {
  background: #f3e8ff;
  color: #9333ea;
}

.catalog-kpi-card p {
  margin: 0;
  color: #0f766e;
  font-size: 13px;
  font-weight: 950;
}

.catalog-kpi-card h2 {
  margin: 4px 0 2px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1;
  font-weight: 950;
}

.catalog-kpi-card small {
  color: #64748b;
  font-weight: 750;
}

.catalog-filter-card {
  margin-bottom: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: white;
  padding: 14px;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 230px 170px 150px;
  gap: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.catalog-main-search {
  height: 48px;
  border: 1px solid #dbe3ec;
  border-radius: 13px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.catalog-main-search input,
.catalog-filter-card select {
  width: 100%;
  height: 48px;
  border: 1px solid #dbe3ec;
  border-radius: 13px;
  padding: 0 13px;
  background: white;
  outline: none;
  color: #0f172a;
  font-weight: 800;
}

.catalog-main-search input {
  border: none;
  padding: 0;
}

.catalog-main-search button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
}

.catalog-filter-search-btn {
  height: 48px;
  border: none;
  border-radius: 13px;
  background: #0d9488;
  color: white;
  font-weight: 950;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}

.catalog-table-card,
.catalog-event-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: white;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  margin-bottom: 18px;
}

.catalog-table-top {
  min-height: 64px;
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.catalog-table-top p {
  margin: 0;
  color: #475569;
  font-weight: 800;
}

.catalog-table-top p b {
  color: #0d9488;
  font-size: 20px;
  margin: 0 5px;
}

.catalog-table-top small {
  color: #64748b;
  font-weight: 650;
}

.catalog-table-tools {
  display: flex;
  gap: 10px;
}

.catalog-table-tools button,
.catalog-table-tools select,
.catalog-pagination-actions button,
.catalog-pagination-actions select {
  height: 40px;
  border: 1px solid #dbe3ec;
  border-radius: 12px;
  background: white;
  padding: 0 13px;
  color: #334155;
  font-weight: 850;
  cursor: pointer;
}

.catalog-table-tools button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.catalog-advanced-filter {
  padding: 12px 18px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.catalog-advanced-filter button {
  height: 36px;
  border: 1px solid #dbe3ec;
  border-radius: 999px;
  background: white;
  color: #334155;
  padding: 0 14px;
  font-weight: 850;
  cursor: pointer;
}

.catalog-advanced-filter button.active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}

.catalog-table-wrap {
  overflow-x: auto;
}

.catalog-table-wrap table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.catalog-table-wrap th {
  background: #f8fafc;
  color: #475569;
  padding: 12px 13px;
  text-align: left;
  font-size: 13px;
  font-weight: 950;
}

.catalog-table-wrap td {
  border-top: 1px solid #eef2f7;
  padding: 12px 13px;
  color: #334155;
  font-size: 14px;
  vertical-align: middle;
}

.catalog-book-cover {
  width: 48px;
  height: 58px;
  border-radius: 9px;
  background: #ecfdf5;
  color: #0f766e;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.catalog-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-isbn-cell {
  font-weight: 850;
  white-space: nowrap;
}

.catalog-title-cell strong {
  color: #0f172a;
  display: block;
  font-weight: 950;
}

.catalog-title-cell small {
  color: #64748b;
  display: block;
  margin-top: 4px;
}

.catalog-status-pill {
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.catalog-status-pill.available {
  background: #dcfce7;
  color: #15803d;
}

.catalog-status-pill.low {
  background: #ffedd5;
  color: #ea580c;
}

.catalog-status-pill.out {
  background: #fee2e2;
  color: #ef4444;
}

.catalog-row-actions {
  display: flex;
  gap: 8px;
}

.catalog-row-actions button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: #f8fafc;
  color: #0f172a;
  cursor: pointer;
}

.catalog-row-actions button:hover {
  background: #ecfdf5;
  color: #0f766e;
}

.catalog-row-actions .delete {
  color: #ef4444;
}

.catalog-pagination-bar {
  padding: 14px 18px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.catalog-pagination-bar span {
  color: #64748b;
  font-weight: 750;
}

.catalog-pagination-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.catalog-pagination-actions button {
  min-width: 40px;
  padding: 0 10px;
}

.catalog-pagination-actions button.active {
  background: #0d9488;
  color: white;
  border-color: #0d9488;
}

.catalog-pagination-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.catalog-event-card {
  padding: 18px;
}

.catalog-event-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.catalog-event-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
}

.catalog-event-head span {
  color: #0d9488;
  font-weight: 950;
}

.catalog-event-empty {
  margin-top: 12px;
  color: #64748b;
  font-weight: 750;
}

.catalog-event-list {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.catalog-event-list > div {
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
}

.catalog-event-list b {
  color: #0f766e;
}

.catalog-event-list p {
  margin: 4px 0;
  color: #334155;
}

.catalog-event-list small {
  color: #64748b;
}

.catalog-state-card {
  min-height: 330px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #64748b;
  padding: 36px;
}

.catalog-state-card h3 {
  color: #0f172a;
  margin: 12px 0 5px;
}

.catalog-state-card p {
  max-width: 460px;
  margin: 0;
  line-height: 1.6;
}

.catalog-dialog-card {
  border-radius: 22px !important;
  padding: 22px;
}

.catalog-dialog-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.catalog-dialog-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
}

.catalog-dialog-head p {
  margin: 5px 0 0;
  color: #64748b;
  font-weight: 750;
}

.catalog-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.catalog-form-grid label {
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.catalog-form-grid input,
.catalog-form-grid textarea,
.catalog-copy-panel input {
  width: 100%;
  margin-top: 7px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px;
  outline: none;
  color: #0f172a;
  font-weight: 750;
}

.catalog-form-grid .full {
  grid-column: 1 / -1;
}

.catalog-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.catalog-cancel-btn,
.catalog-save-btn,
.catalog-copy-actions button {
  height: 43px;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.catalog-cancel-btn {
  background: #f1f5f9;
  color: #334155;
}

.catalog-save-btn {
  background: #0d9488;
  color: white;
}

.catalog-book-detail {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
}

.catalog-detail-cover {
  height: 270px;
  border-radius: 18px;
  overflow: hidden;
  background: #ecfdf5;
  color: #0f766e;
  display: grid;
  place-items: center;
}

.catalog-detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-detail-info h3 {
  margin: 14px 0 8px;
  color: #0f172a;
  font-size: 25px;
  font-weight: 950;
}

.catalog-detail-info p {
  color: #475569;
  line-height: 1.65;
  margin: 0 0 16px;
}

.catalog-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.catalog-detail-grid div {
  border-radius: 13px;
  background: #f8fafc;
  padding: 12px;
}

.catalog-detail-grid span {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 850;
}

.catalog-detail-grid b {
  color: #0f172a;
  display: block;
  margin-top: 5px;
}

.catalog-copy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.catalog-copy-panel {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 16px;
}

.catalog-copy-panel h3 {
  margin: 0 0 6px;
  font-weight: 950;
}

.catalog-copy-panel p {
  color: #64748b;
  line-height: 1.55;
  margin: 0 0 14px;
}

.catalog-copy-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.catalog-copy-actions button {
  background: #ecfdf5;
  color: #0f766e;
}

.catalog-copy-actions .danger {
  background: #fee2e2;
  color: #ef4444;
}

@media (max-width: 1280px) {
  .catalog-inline-hero,
  .catalog-filter-card {
    grid-template-columns: 1fr;
  }

  .catalog-hero-art {
    display: none;
  }

  .catalog-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .catalog-filter-search-btn {
    width: 100%;
  }
}

@media (max-width: 760px) {
  .catalog-inline-hero {
    padding: 24px;
  }

  .catalog-inline-hero h1 {
    font-size: 30px;
  }

  .catalog-kpi-grid,
  .catalog-copy-grid,
  .catalog-form-grid,
  .catalog-book-detail {
    grid-template-columns: 1fr;
  }

  .catalog-table-top,
  .catalog-pagination-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .catalog-table-tools {
    width: 100%;
    flex-direction: column;
  }

  .catalog-table-tools button,
  .catalog-table-tools select {
    width: 100%;
  }
}


/* ================= CIRCULATION SERVICE - NHÓM 2 ================= */
.circulation-page {
  color: #0f172a;
  padding-bottom: 28px;
}

.circulation-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.circulation-kpi-card {
  min-height: 128px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.circulation-kpi-card .icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: grid;
  place-items: center;
}

.circulation-kpi-card .mint {
  background: #dcfce7;
  color: #0f766e;
}

.circulation-kpi-card .blue {
  background: #dbeafe;
  color: #2563eb;
}

.circulation-kpi-card .orange {
  background: #ffedd5;
  color: #ea580c;
}

.circulation-kpi-card .green {
  background: #ccfbf1;
  color: #0d9488;
}

.circulation-kpi-card p {
  margin: 0;
  color: #334155;
  font-size: 15px;
  font-weight: 850;
}

.circulation-kpi-card h2 {
  margin: 6px 0 3px;
  font-size: 33px;
  line-height: 1;
  color: #0d9488;
  font-weight: 950;
}

.circulation-kpi-card small {
  color: #64748b;
  font-weight: 700;
}

.circulation-toolbar-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 220px 220px 150px 180px;
  gap: 14px;
  margin-bottom: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.circulation-search {
  height: 52px;
  border: 1px solid #dbe3ec;
  border-radius: 14px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.circulation-search input,
.circulation-toolbar-card select,
.borrow-form-grid input,
.borrow-form-grid select,
.return-summary input {
  width: 100%;
  height: 52px;
  border: 1px solid #dbe3ec;
  border-radius: 14px;
  padding: 0 14px;
  outline: none;
  color: #0f172a;
  font-weight: 800;
  background: white;
}

.circulation-search input {
  border: none;
  padding: 0;
}

.circulation-search button {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.circulation-refresh-btn,
.circulation-create-btn {
  height: 52px;
  border: none;
  border-radius: 14px;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}

.circulation-refresh-btn {
  background: #ecfdf5;
  color: #0f766e;
}

.circulation-create-btn {
  background: #0d9488;
  color: white;
}

.circulation-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.circulation-table-card,
.side-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.circulation-card-head {
  min-height: 78px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.circulation-card-head h3,
.side-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 950;
}

.circulation-card-head p {
  margin: 5px 0 0;
  color: #64748b;
  font-weight: 700;
}

.circulation-head-actions button {
  height: 40px;
  border: 1px solid #0d9488;
  border-radius: 12px;
  background: white;
  color: #0d9488;
  font-weight: 900;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}

.circulation-table-wrap {
  overflow-x: auto;
}

.circulation-table-wrap table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.circulation-table-wrap th {
  background: linear-gradient(180deg, #f0fdfa, #f8fafc);
  color: #0f172a;
  padding: 14px;
  text-align: left;
  font-size: 13px;
  font-weight: 950;
}

.circulation-table-wrap td {
  border-top: 1px solid #eef2f7;
  padding: 14px;
  color: #334155;
  vertical-align: middle;
}

.circulation-table-wrap td strong {
  display: block;
  color: #0f172a;
  font-weight: 950;
}

.circulation-table-wrap td small {
  display: block;
  color: #64748b;
  margin-top: 4px;
  font-weight: 700;
}

.borrow-code {
  color: #0d9488 !important;
  font-weight: 950;
}

.mini-chip {
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.mini-chip.green {
  background: #dcfce7;
  color: #15803d;
}

.fine-cell {
  font-weight: 950;
}

.fine-cell span {
  display: block;
  font-size: 11px;
  margin-top: 3px;
  font-weight: 900;
}

.fine-cell .paid {
  color: #16a34a;
}

.fine-cell .unpaid {
  color: #ef4444;
}

.borrow-status {
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.borrow-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.borrow-status.borrowing {
  background: #dbeafe;
  color: #2563eb;
}

.borrow-status.returned {
  background: #dcfce7;
  color: #15803d;
}

.borrow-status.overdue {
  background: #fee2e2;
  color: #ef4444;
}

.circulation-row-actions {
  display: flex;
  gap: 8px;
}

.circulation-row-actions button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: #f8fafc;
  color: #0f172a;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.circulation-row-actions button:hover {
  background: #ecfdf5;
  color: #0f766e;
}

.circulation-row-actions .money {
  color: #0d9488;
}

.circulation-state {
  min-height: 360px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #64748b;
  padding: 36px;
}

.circulation-state h3 {
  color: #0f172a;
  margin: 12px 0 5px;
}

.circulation-state p {
  max-width: 520px;
  line-height: 1.65;
}

.circulation-pagination {
  padding: 14px 18px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.circulation-pagination span {
  color: #64748b;
  font-weight: 750;
}

.circulation-pagination div {
  display: flex;
  gap: 8px;
}

.circulation-pagination button {
  min-width: 38px;
  height: 38px;
  border: 1px solid #dbe3ec;
  border-radius: 11px;
  background: white;
  color: #334155;
  font-weight: 900;
  cursor: pointer;
}

.circulation-pagination button.active {
  background: #0d9488;
  border-color: #0d9488;
  color: white;
}

.circulation-pagination button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.circulation-side {
  display: grid;
  gap: 18px;
  align-content: start;
}

.side-card {
  padding: 18px;
}

.side-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.side-head h3 {
  font-size: 17px;
}

.side-head span {
  min-width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #0f766e;
  font-weight: 950;
  display: grid;
  place-items: center;
}

.side-empty {
  min-height: 120px;
  color: #64748b;
  font-weight: 800;
  display: grid;
  place-items: center;
  text-align: center;
}

.overdue-list,
.debt-list,
.event-mini-list {
  display: grid;
  gap: 10px;
}

.overdue-list > div {
  border-radius: 14px;
  background: #fef2f2;
  padding: 12px;
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
}

.overdue-list span {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fee2e2;
  color: #ef4444;
  display: grid;
  place-items: center;
}

.overdue-list b,
.debt-list b,
.event-mini-list b {
  color: #0f172a;
  display: block;
}

.overdue-list p,
.debt-list p,
.event-mini-list p {
  margin: 3px 0;
  color: #475569;
  font-size: 13px;
}

.overdue-list small,
.event-mini-list small {
  color: #64748b;
  font-size: 12px;
}

.debt-list > div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px;
  border: 1px solid #e2e8f0;
}

.debt-list strong {
  color: #ef4444;
}

.event-mini-list > div {
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 8px;
}

.circulation-dialog-card {
  border-radius: 22px !important;
  padding: 24px;
}

.dialog-head-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.dialog-head-row h2 {
  margin: 0;
  color: #0f172a;
  font-size: 23px;
  font-weight: 950;
}

.dialog-head-row p {
  margin: 5px 0 0;
  color: #64748b;
  font-weight: 750;
}

.borrow-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.borrow-form-grid label {
  color: #334155;
  font-size: 13px;
  font-weight: 850;
}

.borrow-form-grid input,
.borrow-form-grid select {
  margin-top: 7px;
}

.borrow-limit-box {
  margin-top: 16px;
  border-radius: 16px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
  padding: 14px;
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;
}

.borrow-limit-box.danger {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #ea580c;
}

.borrow-limit-box b {
  display: block;
}

.borrow-limit-box p {
  margin: 3px 0 0;
  font-weight: 750;
}

.dialog-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  min-width: 128px;
  height: 44px;
  border: none;
  border-radius: 13px;
  padding: 0 16px;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cancel-btn {
  background: #f1f5f9;
  color: #334155;
}

.save-btn {
  background: #0d9488;
  color: white;
}

.save-btn:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.return-summary,
.borrow-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.return-summary > div,
.borrow-detail-grid > div {
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
}

.return-summary span,
.borrow-detail-grid span {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 850;
}

.return-summary b,
.borrow-detail-grid b {
  color: #0f172a;
  display: block;
  margin-top: 6px;
  font-weight: 950;
}

.return-summary input {
  margin-top: 7px;
}

@media (max-width: 1300px) {
  .circulation-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .circulation-toolbar-card,
  .circulation-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .circulation-kpi-grid,
  .borrow-form-grid,
  .return-summary,
  .borrow-detail-grid {
    grid-template-columns: 1fr;
  }

  .circulation-card-head,
  .circulation-pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}


/* ================= CIRCULATION FULL UI - BỔ SUNG ================= */
.circulation-full-page {
  padding-bottom: 34px;
}

.circulation-hero-full {
  min-height: 260px;
  border-radius: 26px;
  margin-bottom: 18px;
  padding: 34px 38px;
  background:
    radial-gradient(circle at 82% 18%, rgba(45, 212, 191, 0.25), transparent 30%),
    linear-gradient(135deg, #064e3b 0%, #0f766e 58%, #0d9488 100%);
  color: white;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 22px;
  align-items: center;
  overflow: hidden;
  position: relative;
  box-shadow: 0 22px 48px rgba(13, 148, 136, 0.16);
}

.circulation-hero-chip {
  width: max-content;
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.14);
  color: #ccfbf1;
  font-size: 13px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 8px;
}

.circulation-hero-full h1 {
  margin: 18px 0 12px;
  font-size: 42px;
  line-height: 1.1;
  font-weight: 950;
}

.circulation-hero-full p {
  max-width: 780px;
  margin: 0 0 24px;
  color: #e0fdfa;
  font-weight: 750;
  line-height: 1.7;
}

.circulation-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-create-borrow,
.hero-refresh-borrow {
  height: 48px;
  border-radius: 14px;
  border: none;
  padding: 0 18px;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.hero-create-borrow {
  background: white;
  color: #0f766e;
}

.hero-refresh-borrow {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.circulation-hero-visual {
  min-height: 190px;
  position: relative;
}

.circulation-books-stack {
  position: absolute;
  right: 36px;
  top: 40px;
  width: 220px;
  display: grid;
  gap: 12px;
}

.circulation-books-stack i {
  height: 34px;
  border-radius: 999px;
  box-shadow: 0 14px 28px rgba(0,0,0,.16);
}

.circulation-books-stack i:nth-child(1) {
  background: #14b8a6;
}

.circulation-books-stack i:nth-child(2) {
  background: #99f6e4;
}

.circulation-books-stack i:nth-child(3) {
  background: #0f766e;
}

.circulation-card-mini {
  position: absolute;
  left: 30px;
  bottom: 16px;
  width: 156px;
  min-height: 132px;
  border-radius: 22px;
  padding: 18px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.22);
  display: grid;
  align-content: center;
}

.circulation-card-mini strong {
  display: block;
  font-size: 34px;
  font-weight: 950;
}

.circulation-card-mini span {
  color: #ccfbf1;
  font-weight: 850;
}

.circulation-kpi-grid.enhanced {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.circulation-kpi-card .yellow {
  background: #fef3c7;
  color: #d97706;
}

.circulation-kpi-card .red {
  background: #fee2e2;
  color: #ef4444;
}

.circulation-tabs-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  box-shadow: 0 12px 28px rgba(15,23,42,.05);
}

.circulation-tabs-card button {
  min-height: 46px;
  border: none;
  border-radius: 14px;
  padding: 0 14px;
  background: transparent;
  color: #334155;
  font-weight: 950;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.circulation-tabs-card button.active {
  background: #0d9488;
  color: white;
  box-shadow: 0 10px 22px rgba(13,148,136,.22);
}

.circulation-tabs-card button span {
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #0f766e;
  display: grid;
  place-items: center;
  padding: 0 7px;
  font-size: 12px;
}

.circulation-tabs-card button.active span {
  background: rgba(255,255,255,.22);
  color: white;
}

.circulation-tab-panel {
  animation: circulationFadeIn .18s ease;
}

@keyframes circulationFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.full-width-table {
  width: 100%;
}

.circulation-create-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.circulation-form-card,
.circulation-guide-card,
.circulation-status-board,
.fine-summary-card,
.fine-list-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  box-shadow: 0 12px 28px rgba(15,23,42,.05);
  padding: 20px;
}

.borrow-form-grid.inline {
  padding: 0;
}

.circulation-guide-card h3,
.circulation-status-board h3,
.fine-summary-card h3 {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 21px;
  font-weight: 950;
}

.guide-item {
  border-radius: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 14px;
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  color: #334155;
  font-weight: 800;
  line-height: 1.5;
}

.guide-item .v-icon {
  color: #0d9488;
}

.board-head {
  margin-bottom: 16px;
}

.board-head h3 {
  margin-bottom: 4px;
}

.board-head p {
  margin: 0;
  color: #64748b;
  font-weight: 750;
}

.borrow-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.borrow-mini-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 10px 22px rgba(15,23,42,.04);
}

.borrow-mini-card.overdue {
  border-color: #fecaca;
  background: #fff7f7;
}

.borrow-mini-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.borrow-mini-top b {
  color: #64748b;
  font-size: 13px;
}

.borrow-mini-card h4 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
}

.borrow-mini-card p {
  margin: 0 0 14px;
  color: #64748b;
  font-weight: 750;
}

.borrow-mini-info {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
}

.borrow-mini-info span {
  color: #475569;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
}

.borrow-mini-card button {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: #0d9488;
  color: white;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.circulation-state.compact {
  min-height: 230px;
}

.fine-dashboard-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 18px;
}

.fine-big-number {
  color: #0d9488;
  font-size: 44px;
  line-height: 1;
  font-weight: 950;
  margin-bottom: 10px;
}

.fine-summary-card p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 18px;
}

.fine-summary-row {
  border-radius: 14px;
  background: #f8fafc;
  padding: 13px;
  display: flex;
  justify-content: space-between;
  color: #334155;
  font-weight: 850;
  margin-bottom: 10px;
}

.fine-summary-row b {
  color: #0d9488;
}

.debt-table-list {
  display: grid;
  gap: 12px;
  padding: 0 20px 20px;
}

.debt-table-list > div {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 130px 150px;
  gap: 14px;
  align-items: center;
}

.debt-table-list b {
  color: #0f172a;
}

.debt-table-list p,
.debt-table-list small {
  color: #64748b;
  margin: 3px 0;
}

.debt-table-list strong {
  color: #ef4444;
  font-size: 18px;
}

.debt-table-list button {
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #0d9488;
  color: white;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
}

.event-timeline {
  padding: 0 20px 22px;
  display: grid;
  gap: 12px;
}

.event-timeline-item {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
}

.event-timeline-item > span {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #ecfdf5;
  color: #0f766e;
  display: grid;
  place-items: center;
}

.event-timeline-item b {
  color: #0d9488;
  font-weight: 950;
}

.event-timeline-item p {
  color: #334155;
  margin: 4px 0;
}

.event-timeline-item small {
  color: #64748b;
}

@media (max-width: 1500px) {
  .circulation-kpi-grid.enhanced {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .borrow-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .circulation-hero-full,
  .circulation-create-grid,
  .fine-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .circulation-hero-visual {
    display: none;
  }

  .circulation-kpi-grid.enhanced {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .circulation-hero-full {
    padding: 24px;
  }

  .circulation-hero-full h1 {
    font-size: 32px;
  }

  .circulation-kpi-grid.enhanced,
  .borrow-card-grid,
  .debt-table-list > div {
    grid-template-columns: 1fr;
  }
}


/* ================= SETTINGS FUNCTIONAL ENHANCEMENT ================= */
.settings-page .setting-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.settings-page .setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07) !important;
}

.settings-tabs-card {
  overflow-x: auto;
}

.save-setting-btn:disabled,
.outline-setting-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.system-log-box {
  max-height: 520px;
  overflow-y: auto;
}

.log-row.info span,
.log-row.INFO span {
  color: #0d9488;
}

.log-row.warn span,
.log-row.WARN span {
  color: #f59e0b;
}

.log-row.error span,
.log-row.ERROR span {
  color: #ef4444;
}

</style>
