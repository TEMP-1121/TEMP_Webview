import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// ① 배포한 웹 주소. 반드시 https:// 로 시작해야 APK에서 열린다.
const BASE_URL = "https://temp-client-two.vercel.app/";

// ② 앱 안에서 그대로 열 도메인. 다른 도메인도 앱 안에서 열어야 하면 여기 추가한다.
//    여기 없는 주소(외부 사이트·mailto·tel 등)는 휴대폰 기본 앱으로 연다.
const IN_APP_HOSTS = [new URL(BASE_URL).host];

function isInAppUrl(url) {
  if (url === "about:blank") return true;
  try {
    const { protocol, host } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return IN_APP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export default function App() {
  const webViewRef = useRef(null);
  const canGoBackRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // 값이 바뀌면 WebView를 새로 만든다. 실패한 페이지는 reload()로 안 돌아오는 경우가 있다.
  const [webViewKey, setWebViewKey] = useState(0);

  // Android 뒤로 가기: 웹에 이전 페이지가 있으면 뒤로, 없으면 앱을 닫는다(false 반환).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setWebViewKey((k) => k + 1);
  };

  const handleShouldStartLoad = ({ url, isTopFrame }) => {
    // iframe 안 이동(지도·영상 등)은 그대로 둔다. Android는 isTopFrame을 주지 않는다.
    if (isTopFrame === false || isInAppUrl(url)) return true;
    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ uri: BASE_URL }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={(nav) => {
          canGoBackRef.current = nav.canGoBack;
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={({ nativeEvent }) => {
          // 4xx는 웹이 자체 화면으로 보여 준다. 서버가 죽은 5xx만 앱이 막는다.
          if (nativeEvent.statusCode >= 500) setHasError(true);
        }}
        // 메모리 부족 등으로 웹 화면 프로세스가 죽으면 흰 화면만 남는다. 다시 만든다.
        onRenderProcessGone={handleRetry}
        onContentProcessDidTerminate={handleRetry}
      />

      {isLoading && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      )}

      {hasError && (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>화면을 불러오지 못했어요</Text>
          <Text style={styles.errorBody}>인터넷 연결을 확인한 뒤 다시 시도해 주세요.</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  webView: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 8 },
  errorBody: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
