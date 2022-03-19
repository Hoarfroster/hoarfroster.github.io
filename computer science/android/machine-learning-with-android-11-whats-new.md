---
title: 使用 Android 11 进行机器学习：新功能
subtitle: Machine Learning with Android 11 - What’s new
date: 2021/02/25 19:23:00
categories:
- [Computer Science, Android]
tags:
- Computer Science
- Android
- Kotlin
description: 本文将会向大家展示如何使用专为 Android 11 设计的工具或插件来开始使用设备上的 ML（Machine Learning，机器学习）功能。如果你以前在 Android 中使用过 ML，则可以跟随本文一起探索将你的 ML 应用程序与 Android 应用程序集成的更简便方法。而如果你没有在 Android 中使用过 ML，那么这可能是你使用 Android 进行 ML 的起点，开始你使用 ML 为你的 Android 应用程序提供超强功能之旅。
---

> * 原文地址：[Machine Learning with Android 11: What’s new](https://proandroiddev.com/machine-learning-with-android-11-whats-new-1a8d084c7398)
> * 原文作者：[Rishit Dagli](https://medium.com/@rishit.dagli)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)
> * 校对者：[HumanBeing](https://github.com/HumanBeingXenon)、[keepmovingljzy](https://github.com/keepmovingljzy)、[lsvih](https://github.com/lsvih)

![使用 Android 11 进行机器学习：新功能](https://cdn-images-1.medium.com/max/3840/1*_6zTCa-SeOV2q549ey3b5Q.jpeg)

本文将会向大家展示如何使用专为 [Android 11](https://developer.android.com/11) 设计的工具或插件来开始使用设备上的 ML（Machine Learning，机器学习）功能。如果你以前在 Android 中使用过 ML，则可以跟随本文一起探索将你的 ML 应用程序与 Android 应用程序集成的更简便方法。而如果你没有在 Android 中使用过 ML，那么这可能是你使用 Android 进行 ML 的起点，开始你使用 ML 为你的 Android 应用程序提供超强功能之旅。在此博客中，我将主要演示 Android 11 的两个最强大的更新：[ML 模型绑定插件](https://developer.android.com/studio/preview/features#tensor-flow-lite-models)和[新的 ML Kit 套件](https://g.co/mlkit)。我们下面讨论的所有示例应用程序代码都可以在[此 GitHub 存储库](https://github.com/Rishit-dagli/ML-with-Android-11)中找到。

你也可以在 [GitHub 存储库](https://github.com/Rishit-dagli/ML-with-Android-11/blob/master/talks.md)中查看有关该主题的讨论。

## 为什么我们要关心 Android 设备上 ML 功能？

如你所见，我们在本文中主要关注设备上的 ML。Android 11 对设备上的 ML 做出了许多很酷的更新，但先简述一下我们为什么要对此加以关注。你也将这里知道为什么会有这么多关于 ML 或 终端 ML 的宣传。

**设备上的 ML 背后的理念：**

这里使用 ML 的方法与我们的旧有方法恰好相反，我们不再将设备上的数据发送到服务器或某个基于云的系统，在上面使用 ML 判断数据，然后再将得出的结论返回给设备。取而代之的是，直接利用设备上的 ML 模型获取输出或推断，即不再让设备发送数据给服务器判断数据，利用移动设备本身，完成所有的处理和推断。

![设备上 ML 背后的理念](https://cdn-images-1.medium.com/max/3836/1*O1a_Su6P-XggXk9IXTSzMQ.jpeg)

你不会直接将模型用于你的设备，而需要在导入前先对你的模型进行压缩或优化，以便能够在设备上正常的运行它 —— 因为终端设备的计算能力、网络可用性和磁盘空间有限。但在本文中，我们将跳过优化过程，直接部署 `.tflite` 模型文件。而你可以进一步了解 [TensorFlow Lite](https://www.tensorflow.org/lite/)和[模型优化过程](https://www.tensorflow.org/lite/performance/model_optimization)。

**设备上进行 ML 的优势**

使用设备上 ML 的一些优点：

* 能量消耗

你所能够想到的第一件事应该就是能耗：曾经你需要耗费大量的能量，将你的视频数据连续发送或流式传输到服务器。但有时这样做是不可行的 —— 没有数据网络的时候。值得一提的是，如果你对你的数据先做大量的预处理，倒也能节省些能耗。

* 推理时间

另一项要考虑的重要事项是获取输出或实际运行模型所花的时间。对于实时应用而言，这是一个相当重要的层面。程序无需发送或接受数据，加快了推理的速度。

* 网络可用性

使用传统方法在考虑网络可用性层面也是相当昂贵的，因为你的设备必须在适宜的带宽或网络环境中，才能连续发送数据并从服务器接收数据才能正常获取 ML 结果。

* 安全

最后，你的数据的安全性也将提升：设备不再需要将数据发送到服务器或基于云的系统，即不再将数据发送出设备，从而增强了安全性。

## ML 模型绑定插件

> 注意：您需要 Android Studio 4.1 或更高版本才能使用 ML 模型绑定插件

**ML 模型绑定插件主要关注什么？**

你可以从“模型构建”这个名称中做出足够合理的猜测，从而了解 [ML 模型绑定插件](https://developer.android.com/studio/preview/features#tensor-flow-lite-models)。它确实可以使我们非常轻松地使用自定义 TF Lite 模型，让我们这群开发人员可以方便地导入任何 TFLite 模型，读取导入的模型的输入或输出的签名，并且只需要再调用几行代码，就可以使用 TensorFlow Lite Android 支持库。

ML 模型绑定插件使您可以在应用程序中轻松使用 TF 模型。从本质上讲，你需要编写的调用 TensorFlow Lite Android 支持库的代码要少得多。如果你曾经使用过 TensorFlow Lite 模型，则你可能知道你首先需要将所有内容都转换为 `ByteArray`。使用 ML 模型绑定插件，你将不再需要再将所有内容都转换为 `ByteArray`。

我喜欢这个新插件的另一个原因是我可以轻松地使用 GPU 和 NN API。使用 ML 模型绑定插件，使用它们从未如此简单。现在，要使用它们，我们仅仅只需要调用一个依赖项和一行代码。难道使用 模型绑定 插件不酷嘛？借助 Android 11 神经网络 API，我们甚至还拥有了无符号整数权重支持和新的服务质量（QOS）API，也同时还支持了更多的终端场景。使用上文谈及的这些功能，你绝对可以更快地进行开发！

**使用模型绑定插件**

现在让我们看看如何实现所讨论的内容。

因此，第一步是导入带有元数据的 TensorFlow Lite 模型。Android Studio 现在有一个用于导入 TensorFlow 模型的新选项：只需右键单击要导入它的模块，随后你将会在 `Others` 下看到一个叫 `TF Lite Model` 的选项。

![Android Studio 中的导入模型选项](https://cdn-images-1.medium.com/max/2500/1*fnNNyLYKqafERAjUfwPsxQ.jpeg)

我们只需传递 `tflite` 模型的路径即可，而它就会自动地在你之前选择的 `ml` 模块中的目录中为我们导入模型。我们现在就可以在其中使用该模型，并且我们只需几个单击即可添加依赖项目和使用 GPU 加速。

![导入 `tflite` 模型](https://cdn-images-1.medium.com/max/2502/1*wJmnVf7wtCOV50HnXXmmPQ.jpeg)

现在从我的模型元数据中，我还可以知道输入、输出的类型以及其他需要被使用的信息 —— 我们可以通过在 Android Studio 中打开 `tflite` 模型文件来查看此信息。在这个屏幕截图中，我使用的是我制作的开源模型来对剪刀、石头、布进行区分。我们只需将手放在摄像头前即可识别出是剪刀还是石头还是布，这也是我在本文中演示的内容。

![查看模型元数据](https://cdn-images-1.medium.com/max/2502/1*ZHuSORcTLhxtSWr60TzxWA.jpeg)

最后，让我们开始使用该模型，以便进行流推断，这很可能也是你想要执行的操作：实时图像分类。要实现这个，最简单的方法是使用 Camera X，并将每个帧传递给可以执行推理的函数。在这里，其实我感兴趣的是进行推断的函数。我们可以发现执行此操作真的是非常容易：在导入可以使用的 TF Lite 模型时，似乎也同时生成了一份示例代码。

```kotlin
private val rpsModel = RPSModel.newInstance(ctx)
```

这里我们将首先实例化一个 `rps` 模型，该模型是剪刀石头布模型的缩写，并将其传递给上下文。在使用这个插件，同时我的模型名称为 `RPS Model.tflite` 的情况下，程序为我创建了一个完全相同名称的类，一个名为 `RPS Model` 的类。

```kotlin
val tfImage = TensorImage.fromBitmap(toBitmap(imageProxy))
```

现在我们需要将数据转换为可使用的格式，以便将其从 `Bitmap` 转换为 `Tensor Image`。如果我们使用 TF 解释器，则我们需要将图像转换为一个`ByteArray`。但现在我们无需再这样做了 —— 直接交给一个图片代理去处理即可。

```kotlin
val outputs = rpsModel.process(tfImage)
    .probabilityAsCategoryList.apply {
        sortByDescending { it.score } // 排序，高匹配率优先
    }.take(MAX_RESULT_DISPLAY) // 抱走第一
```

现在我们已经将数据传递给模型，我们将处理模型中的图像并获得输出，我们将基本上得到一个匹配率的数组并对其进行降序排序，以获取具有最大值的概率，然后选择降序列表的第一名显示出来。

```kotlin
for (output in outputs) {
    items.add(
        Recognition(
            output.label,
            output.score
        )
    )
}
```

最后，我需要向用户显示标签，因此我将在输出中添加与每个条目相对应的标签。这就是我们所需要的全部代码！ 🚀～

**使用 GPU 加速**

如果我们想要使用 GPU 加速，其实做法非常简单。我们只需要在要使用 GPU 并进行构建模型的地方创建一个 `options` 对象。我只是将其作为参数传递给实例化过程。我们现在就可以使用 GPU，这个简易操作让使用 NN API 加速并在 Android 11 上执行更多操作变得非常容易。

```kotlin
private val options = Model.Options.Builder().setDevice(Model.Device.GPU).build()
private val rpsModel = rpsModel.newInstance(ctx, options)
```

## 一个新的 ML Kit 套件

> 我们现在不再需要 Firebase 项目来与 ML Kit 一起使用，虽然说我们依旧可以在 Firebase 中使用它。

另一个值得注意的更新是可以通过 [ML Kit](https://g.co/mlkit) 使用 TensorFlow Lite 模型。而且即使我们不使用 Firebase 项目，我们现在也可以直接使用 ML Kit 了。

正如我之前提到的，由于我之前提到的好处，Android 11 中有许多更新集中在设备上的 ML 上。现在，新的 ML Kit 在设备上具有更好的可用性。ML Kit 的[图像分类](https://developers.google.com/ml-kit/vision/image-labeling/custom-models/android)和[对象检测和跟踪（ODT）](https://developers.google.com/ml-kit/vision/object-detection/custom-models/android)现在也支持自定义模型，这意味着我们可以使用 `tflite` 模型文件走遍 Android 的 ML 了。这也意味着如果我们正在处理某些常见场景，例如对特定类型的对象检测，那么 ML Kit 是最好的选择。

**使用 ML Kit**

让我们在代码中看看如何做到这一点～我们现在将要建立一个可以对不同食品分类的模型，

```kotlin
private localModel = LocalModel.Builder()
    .setAssetFilePath("lite-model_aiy_vision_classifier_food_V1_1.tflite").
    .build()
```

在这里我将首先通过设置模型并为其指定 `tflite` 模型文件路径开始。

```kotlin
private val customObjectDetectorOptions = CustomObjectDetectorOptions
    .Builder(localModel)
    .setDetectorMode(CustomObjectDetectorOptions.STREAM_MODE) 
    .setClassificationConfidenceThreshold(0.8f) 
    .build()
```

然后，此 `tflite` 模型将在带有 ML Kit 的对象检测模型的顶部运行。我们现在可以稍微自定义这些选项。在这里，由于要使用流输入并指定置信度阈值，因此我专门设置了 `STREAM_MODE`。

```kotlin
private val objectDetector = ObjectDetection.getClient(customObjectDetectorOptions) objectDetector.process(image) 
    .addOnFailureListener(Log.d(...))

    .addOnSuccessListener{ 
        graphicsOverlay.clear() 
        for (detectedObject in it){ 
            graphicsOverlay.add(ObjectGraphic(graphicsOverlay, detectedObject))
        } 
        graphicsOverlay.postInvalidate()} 

    .addOnCompleteListenerl imageProxy.close() }
```

让我们进入运行模型的那一部分，这样我们可能会看到一些类似于此处前面示例的语法。我将处理我的图像，这里需要注意的是，所有处于失败或成功状态的侦听器都是必不可缺的代码，在我们的每次运行上都需要附加上这些侦听器。这就是我们所有需要编写的代码！我们已经搞定了！🚀～

## 查找模型

我们讨论了很多有关模型制作后的内容，让我们看看如何为您的用例找到模型。

* TF Lite Model Maker

TensorFlow 团队也于 2020 年初开启了 TF Lite Model Maker。这使得制作好的模型超级容易使用，具有很高的性能，还可以进行大量的自定义。我们现在可以简单地传递数据并使用很少的代码来构建 `tflite` 模型。我们可以查看官网中的 [TensorFlow Lite Model Maker 示例](https://github.com/Rishit-dagli/ML-with-Android-11/blob/dev/TensorFlow_Lite_Model_Maker_example.ipynb)。

* TensorFlow Hub

TensorFlow Hub 是一个开放源代码存储库，其中包含最新技术和有据可查的模型。我们使用 ML Kit 构建的食品分类应用程序也出现在 TF Hub 上。我们还可以使用[社区 tfhub.dev](https://tfhub.dev/) 中的模型。

![tfhub.dev 上的一些发布者](https://cdn-images-1.medium.com/max/2022/0*cv-fzgw2WPuf4PQI.png)

![TF Hub 中的过滤器](https://cdn-images-1.medium.com/max/2000/1*Cu-XiVrzOi2MdKatQ1dpzw.png)

如果你只想查找基于图像或文本的模型，则可以在 TF Hub 中通过添加过滤条件来搜索。例如如果我们要在网络、终端设备或 Corals 上运行 ML，请通过架构、使用的数据集等筛选等等。

我们可以进一步直接从 TF Hub 下载这些模型，也可以非常轻松地使用您自己的数据对这些模型进行迁移学习。但是，在本文中我们将不进一步介绍使用 TF Hub 的迁移学习了。有关 TF Hub 的更多信息，请前往[我的博客](https://towardsdatascience.com/building-better-ai-apps-with-tf-hub-88716b302265)查看。

除此之外，还有不少的服务提供商，例如 [Teachable Machine](https://teachablemachine.withgoogle.com/)，[AutoML](https://cloud.google.com/automl)，但上述的都算是比较常见的提供商。

---

[GitHub 仓库](https://github.com/Rishit-dagli/ML-with-Android-11) 中提供了此处展示的所有有关 TF Lite Model Maker 的示例的代码。我还为您你供了一些已训练的模型，供初学者入门和实验。
