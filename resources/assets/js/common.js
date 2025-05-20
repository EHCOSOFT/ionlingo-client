
$(document).ready(function () {
    // ==============================
    // [전역 초기화]
    // ==============================

    let windowWidth = $(window).width();
    if (windowWidth <= 992) {
        // 📱 **모바일 이벤트 (클릭)**
        $(".btn-nav-remove").click(closeNav);
        $(".btn-nav-open").click(openNav);
    }
    else {
        // 💻 **PC 이벤트 (클릭)**
        $(".btn-nav-open").click(openNav);
        $(".btn-nav-remove").click(closeNav);
        // $(".btn-sidenav-remove").click(closeSideNav);
    }

    // ✅ 닫기 버튼 (사이드 패널)
    $(document).on("click", ".btn-sidenav-remove", function () {
        closeSideNav();
    });

    // 📍 PC로 전환 시, 모바일 스타일/상태 초기화 처리
    $(window).on("resize", function () {
        const windowWidth = $(window).width();

        if (windowWidth > 992) {
            // ✅ 모바일에서 설정된 인라인 스타일 및 클래스 제거
            $(".nav").removeAttr("style").removeClass("animated");
            $(".nav-wrap").removeAttr("style").show();
            $(".btn-nav-remove").removeAttr("style").hide();
            $("body").css("overflow", "auto");
            $(".nav-side").removeClass("show");
            $(".nav-content").removeClass("active").hide();

            // ✅ 모바일 메뉴 상태 초기화
            $(".navbar > li, .nav-item-list, .lnb, .nav-sub-item").removeClass("active");
        }
    });


    // ==============================
    // [함수 실행]
    // ==============================
    initNavMenu(); // 네비게이션 옵션 메뉴 토글 기능
    initThemeToggle(); // 테마 토글 기능 초기화
    initModalSystem(); // 모달 초기 진입 시 한번 실행
    initDropdown(); // 기본 드롭다운 초기화
    initFileUpload(".file-upload-group", "#documentFileUpload");// 파일 업로드 초기화
    initTabControl(".tabs li", ".tab-content"); //
    initHistoryPanel(); // 최근기록 패널 초기화
    initArchivePanel(); // 아카이브 패널 초기화

    // ==============================
    // [함수]
    // ==============================

    /* -- 모바일 메뉴 열기 -- */
    function openNav() {
        if ($(window).width() > 992) return; // PC 환경에서는 실행 안되게 처리

        if (!$(".nav").hasClass("animated")) {
            $(".nav").addClass("animated");
            $(".nav-wrap").fadeIn(200, function () {
                setTimeout(() => {
                    $(".nav").animate({ left: "0px" }, 300);
                }, 100);
                setTimeout(() => {
                    $(".btn-nav-remove").fadeIn(200);
                }, 300); // 300ms 지연 후 버튼 표시
            });
            $("body").css("overflow", "hidden"); // 스크롤 막기
        }
    }

    /* -- 모바일 메뉴 닫기 -- */
    function closeNav() {
        if ($(window).width() > 992) return; // PC 환경에서는 실행 안되게 처리

        $(".nav").animate({ left: "-50%" }, 300, function () {
            $(".nav-wrap").fadeOut(200);
            $(".nav").removeClass("animated");
        });
        $(".nav-side").removeClass('show');
        $("body").css("overflow", "auto"); // 스크롤 다시 활성화
        $(".btn-nav-remove").fadeOut(200); // 닫을 때 버튼 숨김

        // 모든 active 클래스 초기화
        $(".navbar > li, .nav-item-list, .lnb, .nav-sub-item").removeClass("active");
    }

    /* -- 모바일 메뉴 사이드바 열기 -- */
    function toggleSideNav(section) {
        if (section) {
            $(".nav-side").addClass("show");
            $(".nav-content").removeClass("active").hide();
            $("#" + section).addClass("active").show();
            // checkarchiveActive();
        } else {
            closeSideNav();
        }
    }

    /* -- 모바일 메뉴 사이드바 닫기 -- */
    function closeSideNav() {
        $(".nav-side").removeClass("show");
        $(".nav-content").removeClass("active").hide();

        // 내부 컨텐츠
        // $(".btn-archive-edit").removeClass("show");
        // $(".archive-edit").removeClass("show");
        // $(".nav-side-top .check-group").removeClass("show");
        // $(".history-list > li > .check-group").removeClass("show");
    }

    /* -- 탭 기능 -- */
    function initTabControl(tabSelector, contentSelector) {
        const $tabs = $(tabSelector);
        const $contents = $(contentSelector);

        $tabs.on("click", function (e) {
            // ✅ 편집 중이면 탭 이동 막기
            if ($(".history-edit").hasClass("show") || $(".history-check-group").hasClass("show")) {
                alert("편집 모드에서는 탭을 이동할 수 없습니다.");
                return false; // 클릭 이벤트 중단
            }

            e.preventDefault();

            const $clicked = $(this);
            const target = $clicked.data("target");

            // 탭 버튼 active 처리
            $tabs.removeClass("active");
            $clicked.addClass("active");

            // 콘텐츠 show/hide 처리
            $contents.removeClass("active show").hide();
            $(target).addClass("active show").fadeIn(150);
        });

        // 초기 상태 설정
        if ($tabs.filter(".active").length === 0) {
            $tabs.first().addClass("active");
            const firstTarget = $tabs.first().data("target");
            $contents.removeClass("active show").hide();
            $(firstTarget).addClass("active show").show();
        } else {
            $contents.not(".active").hide();
        }
    }

    // 개발 중 수동 조절용 로그인 상태 변수
    window.isLoggedIn = true; // ← 여기서 true 또는 false로 수동 조정

    $(".nav-item").click(function (e) {
        e.preventDefault();
        let target = $(this).data("target");

        const isLoggedIn = !!window.isLoggedIn;

        // ✅ 패널 전환 전 편집모드 초기화
        exitHistoryEditMode(); // 편집 모드 종료 함수를 따로 정의해주세요.
        exitArchiveEditMode(); // 편집 모드 종료 함수를 따로 정의해주세요.

        if (target === "archive") {
            if (isLoggedIn) {
                toggleSideNav(target);
            } else {
                // 모달 띄우기
                openModal("alertModal");
            }
        } else {
            toggleSideNav(target);
        }
    });

    // 사이드바 접기/펼치기 버튼
    $(".btn-nav-reduction").click(function () {
        if ($(".lnb").hasClass("active")) {
            $(".lnb").removeClass("active");
        } else {
            $(".lnb").addClass("active");
            $(".nav-sub-item").removeClass("active");
        }
    });


    /* -- 최근기록 패널 내부 이벤트 -- */
    function initHistoryPanel() {
        // ✅ 주요 요소 캐싱
        const $panel = $("#history"); // 전체 패널
        const $checkAll = $("#historyCheckAll"); // 전체 선택 체크박스
        const $editBtn = $(".btn-history-edit"); // 편집 버튼
        const $removeBtn = $(".btn-sidenav-remove"); // 닫기 버튼
        const $completeBtn = $(".btn-history-complete"); // 완료 버튼
        const $deleteBtn = $(".btn-history-delete"); // 삭제 버튼
        const $checkGroup = $(".history-check-group"); // 상단 체크그룹 영역
        const $editBox = $(".history-edit"); // 편집용 버튼 영역

        // ✅ [1] 편집 버튼 클릭 시: 체크박스 및 편집 UI 표시
        $editBtn.on("click", function () {
            $(this).removeClass("show"); // 편집 버튼 숨김
            $removeBtn.removeClass("show"); // 닫기 버튼 숨김
            $checkGroup.addClass("show"); // 전체 선택 표시
            $editBox.addClass("show"); // 삭제/완료 버튼 표시

            // 현재 활성 탭의 리스트 항목 중 체크박스가 없는 경우 삽입
            $panel.find(".tab-content.active .history-list li").each(function (i) {
                if (!$(this).find(".check-group").length) {
                    const idx = (i + 1).toString().padStart(2, "0"); // check01, check02 ...
                    const checkbox = `
                    <div class="check-group">
                        <input type="checkbox" id="check${idx}" class="history-item-check">
                        <label for="check${idx}"></label>
                    </div>
                `;
                    $(this).prepend(checkbox); // 항목에 체크박스 삽입
                }
            });

            updateCount(); // 선택 수 갱신
        });

        // ✅ [2] 전체 선택 체크박스 변경 시: 현재 탭 내 항목 전체 체크/해제
        $checkAll.on("change", function () {
            const isChecked = $(this).is(":checked");
            $panel.find(".tab-content.active .history-item-check").prop("checked", isChecked); // 전체 반영
            updateCount(); // 선택 수 갱신
        });

        // ✅ [3] 개별 체크박스 변경 시: 수량 카운트만 갱신
        $panel.on("change", ".history-item-check", function () {
            updateCount();
        });

        // ✅ [4] 삭제 버튼 클릭 시: 체크된 항목 제거
        $deleteBtn.on("click", function () {
            $panel.find(".tab-content.active .history-item-check:checked").closest("li").remove(); // 항목 삭제
            updateCount(); // 삭제 후 수량 갱신
        });

        // ✅ [5] 완료 버튼 클릭 시: 편집 모드 종료 및 UI 초기화
        $completeBtn.on("click", function () {
            $editBtn.addClass("show"); // 편집 버튼 다시 표시
            $removeBtn.addClass("show"); // 닫기 버튼 다시 표시
            $checkGroup.removeClass("show"); // 체크박스 영역 숨김
            $editBox.removeClass("show"); // 편집 버튼 숨김

            $checkAll.prop("checked", false); // 전체선택 해제
            $panel.find(".tab-content.active .history-item-check").prop("checked", false); // 개별도 해제

            // ✅ 체크박스 DOM 자체 제거 (편집 전 상태로 복귀)
            $panel.find(".tab-content.active .history-item-check").each(function () {
                const $checkGroup = $(this).closest(".check-group");
                $checkGroup.remove(); // li 안에서 체크박스 그룹 제거
            });

            updateCount(); // 선택 수 초기화
        });

        // ✅ [6] 선택된 항목 수를 상단에 표시하는 함수
        function updateCount() {
            const count = $panel.find(".tab-content.active .history-item-check:checked").length;
            $(".history-check-group label span").text(count); // 예: "3개 선택됨"
        }
    }

    /* -- 최근기록 패널 내부 에디터 기능 초기화 -- */
    function exitHistoryEditMode() {
        const $panel = $("#history");
        const $editBtn = $(".btn-history-edit");
        const $removeBtn = $(".btn-sidenav-remove");
        const $checkGroup = $(".history-check-group");
        const $editBox = $(".history-edit");
        const $checkAll = $("#historyCheckAll");

        // UI 초기화
        $editBtn.addClass("show");
        $removeBtn.addClass("show");
        $checkGroup.removeClass("show");
        $editBox.removeClass("show");

        // 체크 상태 초기화
        $checkAll.prop("checked", false);
        $panel.find(".tab-content .history-item-check").prop("checked", false);

        // 체크박스 DOM 제거
        $panel.find(".tab-content .history-item-check").each(function () {
            const $checkGroup = $(this).closest(".check-group");
            $checkGroup.remove();
        });

        // 선택 수 초기화
        $(".history-check-group label span").text("0");
    }


    /* -- 아카이브 패널 내부 이벤트 -- */
    function initArchivePanel() {
        // ✅ 아카이브 영역 내 주요 요소 캐싱
        const $panel = $("#archive");
        const $checkAll = $("#archiveCheckAll"); // 전체 선택 체크박스
        const $editBtn = $panel.find(".btn-archive-edit"); // 편집 버튼
        const $removeBtn = $panel.find(".btn-sidenav-remove"); // 닫기 버튼
        const $completeBtn = $panel.find(".btn-archive-complete"); // 완료 버튼
        const $deleteBtn = $panel.find(".btn-archive-delete"); // 삭제 버튼
        const $checkGroup = $panel.find(".archive-check-group"); // 상단 체크 영역
        const $editBox = $panel.find(".archive-edit"); // 편집용 버튼 영역
        const $list = $panel.find(".archive-list"); // 항목 리스트

        // ✅ [1] 편집 버튼 클릭 시: 체크박스 및 편집 UI 표시
        $editBtn.on("click", function () {
            $(this).removeClass("show"); // 편집 버튼 숨김
            $removeBtn.removeClass("show"); // 닫기 버튼 숨김
            $checkGroup.addClass("show"); // 전체 선택 영역 표시
            $editBox.addClass("show"); // 삭제/완료 버튼 표시

            // 항목마다 체크박스가 없다면 삽입
            $list.find("li").each(function (i) {
                if (!$(this).find(".check-group").length) {
                    const idx = (i + 1).toString().padStart(2, "0"); // check01, check02 등 생성
                    const checkbox = `
                    <div class="check-group">
                        <input type="checkbox" id="archiveCheck${idx}" class="archive-item-check">
                        <label for="archiveCheck${idx}"></label>
                    </div>
                `;
                    $(this).prepend(checkbox); // 각 li 앞에 체크박스 삽입
                }
            });

            updateCount(); // 선택 수 갱신
        });

        // ✅ [2] 전체 선택 체크박스 변경 시
        $checkAll.on("change", function () {
            const isChecked = $(this).is(":checked");
            $list.find(".archive-item-check").prop("checked", isChecked); // 모든 항목 체크 반영
            updateCount(); // 선택 수 갱신
        });

        // ✅ [3] 개별 항목 체크박스 변경 시
        $list.on("change", ".archive-item-check", function () {
            updateCount(); // 선택 수 갱신
        });

        // ✅ [4] 삭제 버튼 클릭 시: 선택된 항목 제거
        $deleteBtn.on("click", function () {
            $list.find(".archive-item-check:checked").closest("li").remove(); // 체크된 항목 삭제
            updateCount(); // 선택 수 갱신
        });

        // ✅ [5] 완료 버튼 클릭 시: 편집 모드 종료 및 UI 복원
        $completeBtn.on("click", function () {
            $editBtn.addClass("show"); // 편집 버튼 다시 표시
            $removeBtn.addClass("show"); // 닫기 버튼 다시 표시
            $checkGroup.removeClass("show"); // 전체 선택 영역 숨김
            $editBox.removeClass("show"); // 편집 버튼 영역 숨김

            $checkAll.prop("checked", false); // 전체 선택 해제
            $list.find(".archive-item-check").prop("checked", false); // 개별 체크 해제

            // ✅ 삽입된 체크박스 DOM 제거 (기존 항목 복구)
            $list.find(".archive-item-check").each(function () {
                const $checkGroup = $(this).closest(".check-group");
                $checkGroup.remove();
            });

            updateCount(); // 선택 수 초기화
        });

        // ✅ [6] 선택된 항목 수를 상단에 표시하는 함수
        function updateCount() {
            const count = $list.find(".archive-item-check:checked").length;
            $checkGroup.find("label span").text(count); // 숫자 반영
        }
    }

    /* -- 아카이브 패널 내부 에디터 기능 초기화 -- */
    function exitArchiveEditMode() {
        const $panel = $("#archive");
        const $editBtn = $panel.find(".btn-archive-edit");
        const $removeBtn = $panel.find(".btn-sidenav-remove");
        const $checkGroup = $panel.find(".archive-check-group");
        const $editBox = $panel.find(".archive-edit");
        const $checkAll = $("#archiveCheckAll");
        const $list = $panel.find(".archive-list");

        // ✅ UI 상태 복구
        $editBtn.addClass("show");          // 편집 버튼 다시 보이게
        $removeBtn.addClass("show");        // 닫기 버튼 다시 보이게
        $checkGroup.removeClass("show");    // 전체선택 영역 숨김
        $editBox.removeClass("show");       // 편집용 버튼 숨김

        // ✅ 체크 상태 초기화
        $checkAll.prop("checked", false);   // 전체 선택 해제
        $list.find(".archive-item-check").prop("checked", false); // 개별 체크 해제

        // ✅ 삽입된 체크박스 DOM 제거
        $list.find(".archive-item-check").each(function () {
            const $checkGroup = $(this).closest(".check-group");
            $checkGroup.remove(); // li에서 체크박스 그룹 제거
        });

        // ✅ 선택 수 초기화
        $checkGroup.find("label span").text("0");
    }


    // function openOptionMenu(event) {
    //     event.stopPropagation(); // 이벤트 버블링 방지
    //     $(".item-option").removeClass("active"); // 다른 열린 옵션 닫기
    //     $(this).siblings(".item-option").addClass("active"); // 현재 클릭한 옵션 열기
    // }

    // function closeOptionMenu(event) {
    //     if (!$(event.target).closest(".history-item-option").length) {
    //         $(".item-option").removeClass("active"); // 영역 밖 클릭 시 닫기
    //     }
    // }

    // $(".btn-op-open").click(openOptionMenu);
    // $(document).click(closeOptionMenu);

    function toggleMainMenu(e) {
        e.preventDefault();
        let parentLi = $(this).parent();

        // .lnb.active가 있으면 .active 제거
        if ($(".lnb").hasClass("active")) {
            $(".lnb").removeClass("active");
        }

        if (parentLi.hasClass("active")) {
            parentLi.removeClass("active");
            parentLi.find(".nav-item-list").removeClass("active");
        } else {
            $(".navbar > li").removeClass("active").find(".nav-item-list").removeClass("active");
            parentLi.addClass("active");
            parentLi.find(".nav-item-list").addClass("active");
        }

    }

    function toggleSubMenu(e) {
        e.preventDefault();
        let parentLi = $(this).parent();
        let parentList = parentLi.closest(".nav-item-list");

        parentLi.siblings().removeClass("active");
        parentLi.addClass("active");
        parentList.addClass("active");
        parentLi.closest(".nav-sub-item").addClass("active");

    }

    // 키보드 접근성 (키보드 네비게이션 지원)
    function handleFocusMainMenu() {
        let parentLi = $(this).parent();

        if (!parentLi.hasClass("active")) {
            $(".navbar > li").removeClass("active").find(".nav-item-list").removeClass("active");
            parentLi.addClass("active");
            parentLi.find(".nav-item-list").addClass("active");
        }
    }

    // 키보드 접근성 (키보드 네비게이션 지원)
    function handleFocusSubMenu() {
        let parentLi = $(this).parent();
        let parentList = parentLi.closest(".nav-item-list");

        if (!parentLi.hasClass("active")) {
            parentLi.siblings().removeClass("active");
            parentLi.addClass("active");
            parentList.addClass("active");
            parentLi.closest(".nav-sub-item").addClass("active");
        }
    }

    function handleBlur() {
        setTimeout(() => {
            if (!$(".navbar li a:focus, .nav-item-list li a:focus").length) {
                $(".navbar li").removeClass("active");
                $(".nav-item-list").removeClass("active");
            }
        }, 100);
    }

    $(".navbar li > a")
        .on("mousedown", toggleMainMenu)
        .on("focus", handleFocusMainMenu)
        .on("blur", handleBlur);

    $(".nav-item-list li a")
        .on("mousedown", toggleSubMenu)
        .on("focus", handleFocusSubMenu)
        .on("blur", handleBlur);



    /* -- Bootstrap 테마 설정: 라이트 ↔ 다크 -- */
    function initThemeToggle() {
        const $html = $("html"); // <html> 요소 캐싱
        const localStorageKey = "bs-theme"; // 로컬스토리지 키

        // ✅ 1. 저장된 테마 불러오기 또는 기본 테마 설정
        const savedTheme = localStorage.getItem(localStorageKey) || "light";
        $html.attr("data-bs-theme", savedTheme);
        $("#" + savedTheme).prop("checked", true); // 라디오 버튼 상태 반영

        // ✅ 2. 테마 라디오 버튼 변경 시 이벤트 처리
        $("input[name='theme']").on("change", function () {
            const selectedTheme = $(this).attr("id");
            $html.attr("data-bs-theme", selectedTheme);
            localStorage.setItem(localStorageKey, selectedTheme);
        });
    }

    /* -- 옵션 메뉴 -- */
    function initNavMenu() {
        const $navBtn = $(".btn-nav-set");
        const $navMenu = $(".nav-menu");
        const $themeOptions = $(".theme-options");

        // ==============================
        // [📂 메뉴 열기/닫기 이벤트]
        // ==============================

        function toggleNavMenu(e) {
            e.stopPropagation();
            $navMenu.toggleClass("show");
            $themeOptions.removeClass("show"); // 서브메뉴는 항상 초기화
        }

        function closeMenusOnClickOutside(e) {
            if (!$(e.target).closest(".nav-menu").length && !$(e.target).is(".btn-nav-set")) {
                $navMenu.removeClass("show");
                $themeOptions.removeClass("show");
            }
        }

        // ==============================
        // [🎨 테마 서브메뉴 토글 이벤트]
        // ==============================

        function toggleThemeOptions(e) {
            const $submenu = $(this).siblings(".theme-options");
            if ($submenu.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                $(".theme-options").not($submenu).removeClass("show");
                $submenu.toggleClass("show");
            }
        }

        function closeThemeOptionsOnly(e) {
            if (!$(e.target).closest(".theme-options").length &&
                !$(e.target).closest(".nav-menu > li > a").length) {
                $themeOptions.removeClass("show");
            }
        }

        // ==============================
        // [📌 이벤트 바인딩]
        // ==============================

        $navBtn.on("click", toggleNavMenu);
        $(document).on("click", closeMenusOnClickOutside);
        $(".nav-menu > li > a").on("click", toggleThemeOptions);
        $(document).on("click", closeThemeOptionsOnly);
    }


    // 도움말
    function showHelp() {
        $(this).siblings(".help-msg").stop().fadeIn(200);
    }

    function hideHelp() {
        $(this).siblings(".help-msg").stop().fadeOut(200);
    }

    $(".help-group span")
        .hover(showHelp, hideHelp)
        .focus(showHelp)
        .blur(hideHelp);

    $(".accordion-header").click(function () {
        let parent = $(this).parent();

        if (parent.hasClass("active")) {
            parent.removeClass("active").find(".accordion-content").slideUp(300);
        } else {
            $(".accordion-item").removeClass("active").find(".accordion-content").slideUp(300);
            parent.addClass("active").find(".accordion-content").slideDown(300);
        }
    });

    $(".accordion-header").keydown(function (e) {
        if (e.key === "Enter" || e.key === " ") {
            $(this).click();
        }
    });

    $(".chat-reaction .btn-group .btn").click(function () {
        $(this).toggleClass("active");
    });



    // ==============================
    // [모달]
    // ==============================
    let lastFocusedButton = null; // 마지막 포커스된 버튼

    /* -- 모달 시스템 초기화 -- */
    function initModalSystem() {
        // 모달 열기 버튼 클릭 이벤트
        $(".open-modal").click(function () {
            const modalId = $(this).data("modal-id");
            openModal(modalId, $(this));
        });

        // 모달 닫기 버튼 클릭 이벤트
        $(".btn-modal-close").click(function (e) {
            e.stopPropagation();
            const $modal = $(this).closest(".modal-wrap");
            closeModal($modal);
        });

        // 모달 외부 클릭 시 닫기
        $(".modal-wrap").click(function (e) {
            if ($(e.target).is(".modal-wrap")) {
                closeModal($(this));
            }
        });

        // 모달 내부 클릭 시 닫힘 방지
        $(".modal, .modal-content").click(function (e) {
            e.stopPropagation();
        });
    }

    /* -- 모달 열기 -- */
    function openModal(modalId, triggerButton = null) {
        const $modal = $("#" + modalId);

        lastFocusedButton = triggerButton || $(".open-modal[data-modal-id='" + modalId + "']");

        $modal.addClass("active");

        const activeModals = $(".modal-wrap.active").length;
        $modal.css("z-index", 1000 + activeModals);

        $modal.find(".modal-content").attr("tabindex", "-1").focus();

        trapFocus($modal);

        window.addEventListener("wheel", removeDefaultEvent, { passive: false });
    }

    /* -- 모달 닫기 -- */
    function closeModal($modal) {
        $modal.removeClass("active");

        if ($(".modal-wrap.active").length === 0) {
            window.removeEventListener("wheel", removeDefaultEvent);
        }

        if (lastFocusedButton) {
            lastFocusedButton.focus();
        }
    }

    /* -- 포커스 트랩 함수 -- */
    function trapFocus(modalElement) {
        // keydown 제한
        $(document).off("keydown.modal").on("keydown.modal", function (event) {
            if (event.key === "Tab") {
                const focusableElements = modalElement.find(
                    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
                ).filter(":visible");

                const first = focusableElements.first()[0];
                const last = focusableElements.last()[0];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        // 포커스 강제 이동
        $(document).off("focusin.modal").on("focusin.modal", function (event) {
            if (!modalElement[0].contains(event.target)) {
                event.stopPropagation();
                modalElement.find(".modal-content").focus();
            }
        });
    }

    /* -- 휠 스크롤 방지 -- */
    function removeDefaultEvent(e) {
        e.preventDefault();
    }




    // ==============================
    // [프로필 설정] 프로필 이미지 교체
    // ==============================

    // 버튼 클릭 시 input[type='file'] 클릭
    $(".btn-file-upload").on("click", function () {
        $(this).siblings("input[type='file']").click();
    });

    // 파일 업로드 처리
    $("#fileUpload").on("change", function () {
        const file = this.files[0];
        const maxSizeMB = 10;

        if (!file) return;

        const fileType = file.type;
        const fileSizeMB = file.size / (1024 * 1024);

        // 1️⃣ 파일 형식 검사 (image/jpeg, image/png)
        if (fileType !== "image/jpeg" && fileType !== "image/png") {
            openModal("alertModal01");
            $(this).val(""); // 파일 초기화
            return;
        }

        // 2️⃣ 파일 크기 검사 (10MB 초과)
        if (fileSizeMB > maxSizeMB) {
            openModal("alertModal02");
            $(this).val(""); // 파일 초기화
            return;
        }

        // 3️⃣ 미리보기 적용
        const reader = new FileReader();
        reader.onload = function (e) {
            $("label[for='fileUpload']").css({
                "background-image": `url(${e.target.result})`,
                "background-size": "cover",
                "background-position": "center center"
            });
        };
        reader.readAsDataURL(file);
    });





    // ==============================
    // [대화진행] 
    // ==============================

    /* -- 드롭다운 -- */
    function initDropdown(selector = ".dropdown") {
        // 드롭다운 버튼 클릭 이벤트
        $(`${selector} .dropbtn`).on("click", function (e) {
            e.stopPropagation();

            const $dropdown = $(this).closest(selector);
            const $content = $dropdown.find(".dropdown-content");

            // 다른 드롭다운 닫기
            $(`${selector} .dropdown-content`).not($content).fadeOut(150);

            // 현재 드롭다운 토글
            $content.stop(true, true).fadeIn(150);
        });

        // 문서 클릭 시 모든 드롭다운 닫기
        $(document).on("click", function () {
            $(`${selector} .dropdown-content`).fadeOut(150);
        });
    }






    // ==============================
    // [Swiper]
    // ==============================
    const chatSwiper = new Swiper(".chat-swiper", {
        // 모바일 (768px 이하)
        slidesPerView: 2,
        spaceBetween: 8, // 슬라이드 간 여백 축소
        slidesOffsetBefore: 0, // 시작 전 여백 축소
        slidesOffsetAfter: 0,
        // loop: false, // 무한 롤링 효과 추가
        // speed: 4000, // 슬라이드 이동 속도
        // autoplay: {
        //     delay: 0, // 딜레이 없이 계속 움직이도록 설정
        //     disableOnInteraction: false
        // },
        centeredSlides: false, // 중앙 정렬
        allowTouchMove: true, // 사용자가 직접 드래그하지 못하도록 설정
        navigation: {
            nextEl: ".chat-swiper-button-next",
            prevEl: ".chat-swiper-button-prev"
        },
        breakpoints: {
            500: {
                slidesPerView: 2,
                spaceBetween: 8, // 슬라이드 간 여백 축소
                slidesOffsetBefore: 0, // 시작 전 여백 축소
                slidesOffsetAfter: 0  // 끝 부분 여백 축소
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 8, // 슬라이드 간 여백 축소
                slidesOffsetBefore: 0, // 시작 전 여백 축소
                slidesOffsetAfter: 0  // 끝 부분 여백 축소
            },// 태블릿 (768px ~ 1200px)
            992: {
                slidesPerView: 3,
                spaceBetween: 8, // 슬라이드 간 여백
                slidesOffsetBefore: 0, // 시작 전 여백
                slidesOffsetAfter: 0  // 끝 부분 여백
            }
        }
    });





    // ==============================
    // [문서요약] 문서 업로드
    // ==============================
    function initFileUpload(wrapperSelector, inputSelector) {
        // 🔹 초기 상태로 ul 숨김 처리
        $(`${wrapperSelector} ul`).hide();

        // 🔹 파일 변경(업로드) 이벤트
        $(inputSelector).on("change", function () {
            const file = this.files[0];
            if (!file) return;

            const maxSize = 100 * 1024 * 1024; // 100MB
            const fileName = file.name;
            const fileExt = fileName.split(".").pop().toLowerCase(); // 확장자 추출

            // 🔸 확장자 유효성 검사
            if (fileExt !== "pdf" && fileExt !== "docx") {
                alert("PDF 또는 DOCX 파일만 업로드할 수 있습니다.");
                $(this).val(""); // 파일 초기화
                return;
            }

            // 🔸 용량 검사
            if (file.size > maxSize) {
                alert("100MB 이하의 파일만 업로드할 수 있습니다.");
                $(this).val(""); // 파일 초기화
                return;
            }

            // 🔸 확장자를 제외한 파일명 추출
            const title = fileName.replace(/\.[^/.]+$/, "");

            // 🔸 업로드 후 정보 출력
            const $wrapper = $(wrapperSelector);
            $wrapper.find("ul").show(); // 숨겨진 ul 표시
            $wrapper.find(".file-upload-group-info h5").text(title); // 제목
            $wrapper.find(".file-upload-group-info h6").text(fileExt); // 확장자
        });
    }
});