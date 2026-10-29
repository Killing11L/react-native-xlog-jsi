cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

set(rnoh_xlog_jsi_generated_dir "${CMAKE_CURRENT_SOURCE_DIR}/generated")

file(GLOB_RECURSE rnoh_xlog_jsi_generated_SRC
    "${rnoh_xlog_jsi_generated_dir}/*.cpp"
)

set(rnoh_xlog_jsi_SRC ${rnoh_xlog_jsi_generated_SRC})

if(NOT rnoh_xlog_jsi_SRC)
    message(FATAL_ERROR "rnoh_xlog_jsi: no .cpp sources found under ${CMAKE_CURRENT_SOURCE_DIR}")
endif()

add_library(rnoh_xlog_jsi SHARED ${rnoh_xlog_jsi_SRC} RNXlogJSIModule.cpp)

target_include_directories(rnoh_xlog_jsi PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${rnoh_xlog_jsi_generated_dir}
)
target_link_libraries(rnoh_xlog_jsi PUBLIC rnoh)
set(XLOG_SO "${CMAKE_CURRENT_SOURCE_DIR}/../../../libs/${OHOS_ARCH}/libmarsxlog.so")
if(NOT EXISTS "${XLOG_SO}")
    message(FATAL_ERROR "rnoh_xlog_jsi: no bundled xlog library for ${OHOS_ARCH}")
endif()
target_link_libraries(rnoh_xlog_jsi PUBLIC "${XLOG_SO}")
